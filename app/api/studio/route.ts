import { isEditor } from '@/lib/editor-auth';
import { database, readContent } from '@/lib/site-data';
import { validateContent } from '@/lib/content';
const response = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET() {
  if (!(await isEditor())) return response({ error: 'Acesso restrito.' }, 403);
  const db = database();
  const [content, row, messages] = await Promise.all([
    readContent(),
    db
      .prepare('SELECT updated_at FROM site_content WHERE id = ?')
      .bind('main')
      .first<{ updated_at: string }>(),
    db
      .prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 100')
      .all(),
  ]);
  return response({
    content,
    version: row?.updated_at || '',
    messages: messages.results,
  });
}
export async function PUT(request: Request) {
  if (
    request.headers.get('origin') !== new URL(request.url).origin ||
    !(await isEditor())
  )
    return response({ error: 'Acesso restrito.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json'))
    return response({ error: 'Formato inválido.' }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 500000)
      return response({ error: 'Conteúdo muito grande.' }, 413);
    const { content, version } = JSON.parse(raw);
    if (typeof version !== 'string' || !validateContent(content))
      return response(
        {
          error:
            'Confira os campos: URLs devem usar HTTPS, imagens precisam de descrição, datas devem ser válidas e cada item precisa de suas informações obrigatórias.',
        },
        400,
      );
    const db = database();
    const updatedAt = new Date().toISOString();
    const result = version
      ? await db
          .prepare(
            'UPDATE site_content SET value = ?, updated_at = ? WHERE id = ? AND updated_at = ?',
          )
          .bind(JSON.stringify(content), updatedAt, 'main', version)
          .run()
      : await db
          .prepare(
            'INSERT INTO site_content (id,value,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING',
          )
          .bind('main', JSON.stringify(content), updatedAt)
          .run();
    if (!result.meta.changes)
      return response(
        {
          error:
            'O conteúdo mudou em outra janela. Copie suas alterações e recarregue antes de salvar.',
        },
        409,
      );
    return response({ ok: true, version: updatedAt });
  } catch (e) {
    return response(
      {
        error:
          e instanceof SyntaxError
            ? 'Formato inválido.'
            : 'Não foi possível salvar. Suas alterações continuam nesta tela.',
      },
      e instanceof SyntaxError ? 400 : 503,
    );
  }
}
