import { database } from '@/lib/site-data';
import { digestToken, hashPassword } from '@/lib/password';
import { createSession } from '@/lib/editor-auth';
import {
  authBody,
  authQuota,
  authResponse,
  credentials,
  sameOrigin,
} from '@/lib/auth-request';

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return authResponse({ error: 'Solicitação inválida.' }, 403);
  try {
    const data = await authBody(request);
    const input = credentials(data, true);
    if (!input)
      return authResponse(
        {
          error: 'Informe um e-mail válido e uma senha de 15 a 128 caracteres.',
        },
        400,
      );
    if (!(await authQuota(request, input.email)))
      return authResponse(
        { error: 'Muitas tentativas. Aguarde dez minutos.' },
        429,
        { 'Retry-After': '600' },
      );
    if (typeof data?.token !== 'string' || !/^[a-f0-9]{64}$/.test(data.token))
      return authResponse(
        { error: 'Link de primeiro acesso inválido ou expirado.' },
        403,
      );
    const tokenHash = digestToken(data.token);
    const db = database();
    const bootstrap = await db
      .prepare(
        "SELECT id FROM studio_bootstrap WHERE id = 'owner' AND token_hash = ? AND expires_at > ? AND NOT EXISTS (SELECT 1 FROM studio_accounts)",
      )
      .bind(tokenHash, Date.now())
      .first();
    if (!bootstrap)
      return authResponse(
        {
          error:
            'Link de primeiro acesso inválido ou expirado. Se você já criou seu acesso, entre com seu e-mail e senha.',
        },
        403,
      );
    const passwordHash = await hashPassword(input.password);
    // Recheck token and account absence inside the atomic write, after hashing.
    const account = await db
      .prepare(
        "INSERT INTO studio_accounts (id,email,password_hash,created_at) SELECT 'owner',?,?,? WHERE EXISTS (SELECT 1 FROM studio_bootstrap WHERE id = 'owner' AND token_hash = ? AND expires_at > ?) AND NOT EXISTS (SELECT 1 FROM studio_accounts) ON CONFLICT DO NOTHING RETURNING id",
      )
      .bind(input.email, passwordHash, Date.now(), tokenHash, Date.now())
      .first<{ id: string }>();
    if (!account)
      return authResponse(
        { error: 'Este primeiro acesso já foi utilizado ou expirou.' },
        409,
      );
    await db.prepare("DELETE FROM studio_bootstrap WHERE id = 'owner'").run();
    return authResponse({ ok: true }, 201, {
      'Set-Cookie': await createSession(account.id, request),
    });
  } catch {
    return authResponse(
      {
        error:
          'Não foi possível concluir. Tente entrar com os dados escolhidos ou tente novamente.',
      },
      503,
    );
  }
}
