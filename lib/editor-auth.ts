import { headers } from 'next/headers';
import { database } from '@/lib/site-data';
import { digestToken, newToken } from '@/lib/password';

export const sessionCookieName = 'acacias_studio_session';
const sessionSeconds = 8 * 60 * 60;
export function sessionToken(cookie: string | null) {
  const value = cookie
    ?.split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(sessionCookieName + '='))
    ?.slice(sessionCookieName.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}
export function sessionCookie(
  token: string,
  request: Request,
  maxAge = sessionSeconds,
) {
  return `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export async function getEditor() {
  const token = sessionToken((await headers()).get('cookie'));
  if (!token) return null;
  return database()
    .prepare(
      'SELECT a.id, a.email FROM studio_sessions s JOIN studio_accounts a ON a.id = s.account_id WHERE s.token_hash = ? AND s.expires_at > ?',
    )
    .bind(digestToken(token), Date.now())
    .first<{ id: string; email: string }>();
}
export async function isEditor() {
  return !!(await getEditor());
}
export async function createSession(accountId: string, request: Request) {
  const token = newToken();
  const previous = sessionToken(request.headers.get('cookie'));
  const db = database();
  await db.batch([
    db
      .prepare(
        'DELETE FROM studio_sessions WHERE expires_at <= ? OR token_hash = ?',
      )
      .bind(Date.now(), previous ? digestToken(previous) : ''),
    db
      .prepare(
        'INSERT INTO studio_sessions (token_hash,account_id,expires_at) VALUES (?,?,?)',
      )
      .bind(digestToken(token), accountId, Date.now() + sessionSeconds * 1000),
  ]);
  return sessionCookie(token, request);
}
