import { database } from '@/lib/site-data';
import { digestToken } from '@/lib/password';
import { sessionToken, sessionCookie } from '@/lib/editor-auth';
import { authResponse, sameOrigin } from '@/lib/auth-request';

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return authResponse({ error: 'Solicitação inválida.' }, 403);
  try {
    const token = sessionToken(request.headers.get('cookie'));
    if (token)
      await database()
        .prepare('DELETE FROM studio_sessions WHERE token_hash = ?')
        .bind(digestToken(token))
        .run();
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/studio',
        'Set-Cookie': sessionCookie('', request, 0),
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return authResponse(
      { error: 'Não foi possível encerrar a sessão agora. Tente novamente.' },
      503,
    );
  }
}
