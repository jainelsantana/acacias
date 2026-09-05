import { database } from '@/lib/site-data';
import { validDate } from '@/lib/content';
const error = (message: string, status = 400) =>
  Response.json({ error: message }, { status });
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return error('Origem da solicitação inválida.', 403);
  if (!request.headers.get('content-type')?.includes('application/json'))
    return error('Formato inválido.', 415);
  try {
    const raw = await request.text();
    if (raw.length > 20000)
      return error('Sua mensagem excedeu o limite de tamanho.', 413);
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data))
      return error('Confira os campos do formulário.');
    const d = data as Record<string, unknown>;
    if (d.website) return error('Não foi possível validar a solicitação.');
    const limits: Record<string, number> = {
      name: 120,
      company: 160,
      city: 120,
      event: 200,
      date: 10,
      phone: 30,
      email: 254,
      message: 5000,
    };
    for (const [field, max] of Object.entries(limits))
      if (typeof d[field] !== 'string' || (d[field] as string).length > max)
        return error('Confira os campos do formulário.');
    const c = Object.fromEntries(
      Object.keys(limits).map((k) => [k, (d[k] as string).trim()]),
    );
    if (
      !c.name ||
      !c.city ||
      !c.event ||
      !c.message ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)
    )
      return error('Preencha nome, cidade, evento, e-mail e mensagem.');
    if (
      c.date &&
      (!validDate(c.date) ||
        c.date <
          new Date().toLocaleDateString('en-CA', {
            timeZone: 'America/Sao_Paulo',
          }))
    )
      return error('Informe uma data válida a partir de hoje.');
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(
        request.headers.get('cf-connecting-ip') || 'local',
      ),
    );
    const key = Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('');
    const window = Math.floor(Date.now() / 600000);
    const db = database();
    const quota = await db
      .prepare(
        'INSERT INTO rate_limits (id,count,window) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count = CASE WHEN rate_limits.window = excluded.window THEN rate_limits.count + 1 ELSE 1 END, window = excluded.window RETURNING count',
      )
      .bind(key, window)
      .first<{ count: number }>();
    if (!quota || quota.count > 5)
      return error(
        'Muitas tentativas em pouco tempo. Aguarde dez minutos e tente novamente.',
        429,
      );
    // Bound rate-limit metadata retention without retaining the visitor IP.
    await db
      .prepare('DELETE FROM rate_limits WHERE window < ?')
      .bind(window - 144)
      .run();
    await db
      .prepare(
        'INSERT INTO inquiries (id,name,company,city,event,date,phone,email,message,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        crypto.randomUUID(),
        c.name,
        c.company,
        c.city,
        c.event,
        c.date,
        c.phone,
        c.email,
        c.message,
        new Date().toISOString(),
      )
      .run();
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof SyntaxError) return error('Formato inválido.');
    console.error('Booking could not be stored.');
    return error(
      'Não foi possível registrar agora. Tente novamente em instantes.',
      503,
    );
  }
}
