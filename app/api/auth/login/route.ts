import { database } from '@/lib/site-data';
import { verifyPassword } from '@/lib/password';
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
    const input = credentials(await authBody(request));
    if (!input)
      return authResponse({ error: 'Confira o e-mail e a senha.' }, 400);
    if (!(await authQuota(request, input.email)))
      return authResponse(
        { error: 'Muitas tentativas. Aguarde dez minutos e tente novamente.' },
        429,
        { 'Retry-After': '600' },
      );
    const account = await database()
      .prepare('SELECT id,password_hash FROM studio_accounts WHERE email = ?')
      .bind(input.email)
      .first<{ id: string; password_hash: string }>();
    const valid = await verifyPassword(
      input.password,
      account?.password_hash || null,
    );
    if (!valid || !account)
      return authResponse({ error: 'E-mail ou senha incorretos.' }, 401);
    return authResponse({ ok: true }, 200, {
      'Set-Cookie': await createSession(account.id, request),
    });
  } catch {
    return authResponse(
      { error: 'Não foi possível entrar agora. Tente novamente.' },
      503,
    );
  }
}
