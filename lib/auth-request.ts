import { database } from '@/lib/site-data';
import { digestToken } from '@/lib/password';

export const authResponse = (
  data: unknown,
  status = 200,
  extra: Record<string, string> = {},
) =>
  Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      ...extra,
    },
  });
export const sameOrigin = (request: Request) =>
  request.headers.get('origin') === new URL(request.url).origin;
export async function authBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  if (
    !request.headers.get('content-type')?.includes('application/json') ||
    !request.body
  )
    return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let raw = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) {
      await reader.cancel();
      return null;
    }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  try {
    const data = JSON.parse(raw);
    return data && typeof data === 'object' && !Array.isArray(data)
      ? data
      : null;
  } catch {
    return null;
  }
}
export function credentials(
  data: Record<string, unknown> | null,
  setup = false,
) {
  if (typeof data?.email !== 'string' || typeof data.password !== 'string')
    return null;
  const email = data.email.trim().toLowerCase();
  const password = data.password;
  const length = Array.from(password).length;
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    length < (setup ? 15 : 1) ||
    length > 128
  )
    return null;
  return { email, password };
}
export async function authQuota(request: Request, email?: string) {
  const window = Math.floor(Date.now() / 600000);
  const keys = [
    {
      id:
        'studio:ip:' +
        digestToken(request.headers.get('cf-connecting-ip') || 'local'),
      limit: 30,
    },
  ];
  if (email) keys.push({ id: 'studio:email:' + digestToken(email), limit: 10 });
  const db = database();
  const results = await db.batch(
    keys.map((k) =>
      db
        .prepare(
          'INSERT INTO rate_limits (id,count,window) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count = CASE WHEN rate_limits.window = excluded.window THEN rate_limits.count + 1 ELSE 1 END, window = excluded.window RETURNING count',
        )
        .bind(k.id, window),
    ),
  );
  await db
    .prepare('DELETE FROM rate_limits WHERE window < ?')
    .bind(window - 144)
    .run();
  return results.every((r, i) => {
    const count = (r.results[0] as { count?: unknown } | undefined)?.count;
    return typeof count === 'number' && count <= keys[i].limit;
  });
}
