import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';

const options = { N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 };
const derive = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, Buffer.from(salt, 'hex'), 32, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
export const digestToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');
export const newToken = () => randomBytes(32).toString('hex');
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt-v1:${salt}:${(await derive(password, salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string | null) {
  const match = /^scrypt-v1:([a-f0-9]{32}):([a-f0-9]{64})$/.exec(stored || '');
  // Run the same expensive operation for unknown accounts as for wrong passwords.
  const derived = await derive(password, match?.[1] || '0'.repeat(32));
  const expected = Buffer.from(match?.[2] || '0'.repeat(64), 'hex');
  return timingSafeEqual(derived, expected) && !!match;
}
