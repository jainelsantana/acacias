import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { localSql } from './local-database.mjs';

// Local integration test before first-access handoff. Never overwrites an owner.
const base = 'http://localhost:3000';
const marker = randomBytes(8).toString('hex');
const emails = [
  `auth-${marker}@example.invalid`,
  `race-${marker}@example.invalid`,
];
const rateEmail = `rate-${marker}@example.invalid`;
const password = randomBytes(24).toString('base64url');
const token = randomBytes(32).toString('hex');
const sha = (text) => createHash('sha256').update(text).digest('hex');
const tokenHash = sha(token);
const count = await localSql('SELECT count(*) AS count FROM studio_accounts;');
assert.equal(
  count[0].results[0].count,
  0,
  'Run before configuring the real owner.',
);
const originalBootstrap = await localSql('SELECT * FROM studio_bootstrap;');
const post = (path, body, cookie = '', origin = base) =>
  fetch(base + path, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
const editor = (cookie) =>
  fetch(base + '/api/studio', { headers: cookie ? { Cookie: cookie } : {} });
const cookieOf = (response) =>
  response.headers.get('set-cookie')?.split(';')[0];
const installToken = (expires) =>
  localSql(
    `INSERT INTO studio_bootstrap(id,token_hash,expires_at) VALUES('owner','${tokenHash}',${expires}) ON CONFLICT(id) DO UPDATE SET token_hash=excluded.token_hash,expires_at=excluded.expires_at;`,
  );
const pass = (message) => console.log('PASS ' + message);
try {
  assert.equal((await editor()).status, 403);
  assert.equal((await editor('__sites_local_auth=1')).status, 403);
  assert.equal(
    (await editor('acacias_studio_session=' + 'a'.repeat(64))).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + '/api/studio', {
        headers: {
          'oai-authenticated-user-id': 'local_seedy',
          'oai-authenticated-user-email': 'seedy@sites.test',
        },
      })
    ).status,
    403,
  );
  pass(
    'Anonymous, forged cookies and old ChatGPT identity cannot enter the CMS',
  );
  const setup = { email: emails[0], password, token };
  await installToken(Date.now() - 1000);
  assert.equal((await post('/api/auth/setup', setup)).status, 403);
  await installToken(Date.now() + 600000);
  assert.equal(
    (await post('/api/auth/setup', { ...setup, token: 'f'.repeat(64) })).status,
    403,
  );
  assert.equal(
    (await post('/api/auth/setup', { ...setup, password: 'short' })).status,
    400,
  );
  assert.equal(
    (await post('/api/auth/setup', { ...setup, password: '😀'.repeat(8) }))
      .status,
    400,
  );
  assert.equal(
    (await post('/api/auth/setup', setup, '', 'https://other.example')).status,
    403,
  );
  const race = await Promise.all(
    emails.map((email) => post('/api/auth/setup', { ...setup, email })),
  );
  assert.equal(
    race.filter((r) => r.status === 201).length,
    1,
    'Only one concurrent setup may succeed',
  );
  assert(
    race.every((r) => [201, 403, 409].includes(r.status)),
    'No unexpected setup error: ' + race.map((r) => r.status),
  );
  const winner = race.findIndex((r) => r.status === 201);
  const email = emails[winner];
  const setupCookie = cookieOf(race[winner]);
  assert(setupCookie);
  assert.equal((await post('/api/auth/setup', setup)).status, 403);
  pass(
    'Setup requires a live one-use token and is safe under concurrent requests',
  );
  const wrong = await post('/api/auth/login', {
    email,
    password: 'incorrect-password-123',
  });
  const unknown = await post('/api/auth/login', {
    email: 'unknown-' + marker + '@example.invalid',
    password,
  });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.deepEqual(await wrong.json(), await unknown.json());
  const login = await post(
    '/api/auth/login',
    { email: email.toUpperCase(), password },
    setupCookie,
  );
  assert.equal(login.status, 200);
  const cookie = cookieOf(login);
  const setCookie = login.headers.get('set-cookie');
  assert(
    setCookie.includes('HttpOnly') &&
      setCookie.includes('SameSite=Strict') &&
      setCookie.includes('Max-Age=28800'),
  );
  assert.equal(
    (await editor(setupCookie)).status,
    403,
    'Login rotates the previous session',
  );
  const initial = await editor(cookie);
  assert.equal(initial.status, 200);
  const snapshot = await initial.json();
  const save = await fetch(base + '/api/studio', {
    method: 'PUT',
    headers: {
      Cookie: cookie,
      Origin: base,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: snapshot.content,
      version: snapshot.version,
    }),
  });
  assert.equal(save.status, 200);
  assert.deepEqual(
    (await (await editor(cookie)).json()).content,
    snapshot.content,
  );
  assert.equal(
    (
      await post(
        '/api/auth/login',
        { email, password },
        cookie,
        'https://other.example',
      )
    ).status,
    403,
  );
  assert.equal(
    (await post('/api/auth/logout', {}, cookie, 'https://other.example'))
      .status,
    403,
  );
  const crossSave = await fetch(base + '/api/studio', {
    method: 'PUT',
    headers: {
      Cookie: cookie,
      Origin: 'https://other.example',
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  assert.equal(crossSave.status, 403);
  pass(
    'E-mail/password login, session rotation, authorized save and origin protections work',
  );
  const stored = await localSql(
    `SELECT password_hash FROM studio_accounts WHERE email='${email}'; SELECT token_hash FROM studio_sessions;`,
  );
  assert(stored[0].results[0].password_hash.startsWith('scrypt-v1:'));
  assert(!JSON.stringify(stored).includes(password));
  const rawSession = cookie.split('=')[1];
  assert(!JSON.stringify(stored).includes(rawSession));
  await localSql(
    `UPDATE studio_sessions SET expires_at=0 WHERE token_hash='${sha(rawSession)}';`,
  );
  assert.equal((await editor(cookie)).status, 403);
  const again = await post('/api/auth/login', { email, password });
  assert.equal(again.status, 200);
  const againCookie = cookieOf(again);
  const logout = await post('/api/auth/logout', {}, againCookie);
  assert.equal(logout.status, 303);
  assert(logout.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal((await editor(againCookie)).status, 403);
  pass(
    'Only hashes are persisted; expired and logged-out sessions are rejected',
  );
  let limited;
  for (let i = 0; i < 11; i++)
    limited = await post('/api/auth/login', { email: rateEmail, password });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '600');
  pass('Repeated login attempts are limited');
} finally {
  const testEmails = [
    ...emails,
    rateEmail,
    'unknown-' + marker + '@example.invalid',
  ];
  const emailKeys = testEmails.map((e) => `'studio:email:${sha(e)}'`).join(',');
  await localSql(
    `DELETE FROM studio_accounts WHERE email IN ('${emails[0]}','${emails[1]}'); DELETE FROM studio_bootstrap WHERE token_hash='${tokenHash}'; DELETE FROM rate_limits WHERE id IN (${emailKeys},'studio:ip:${sha('local')}');`,
  );
  // Restore a still-pending local bootstrap only if this test displaced it.
  for (const previous of originalBootstrap[0].results) {
    if (/^[a-f0-9]{64}$/.test(previous.token_hash))
      await localSql(
        `INSERT INTO studio_bootstrap(id,token_hash,expires_at) SELECT 'owner','${previous.token_hash}',${Number(previous.expires_at)} WHERE NOT EXISTS(SELECT 1 FROM studio_accounts) ON CONFLICT DO NOTHING;`,
      );
  }
}
console.log(
  'Authentication checks passed; temporary test accounts and sessions removed.',
);
