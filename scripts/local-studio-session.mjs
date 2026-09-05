export async function localStudioCookie(base = 'http://localhost:3000') {
  if (process.env.STUDIO_SESSION_COOKIE)
    return process.env.STUDIO_SESSION_COOKIE;
  const email = process.env.STUDIO_EMAIL;
  const password = process.env.STUDIO_PASSWORD;
  if (!email || !password)
    throw new Error(
      'Informe STUDIO_EMAIL e STUDIO_PASSWORD no ambiente local, ou STUDIO_SESSION_COOKIE. Não inclua credenciais no código.',
    );
  const response = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { Origin: base, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok)
    throw new Error('Não foi possível autenticar no painel local.');
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (!cookie) throw new Error('Sessão local indisponível.');
  return cookie;
}
