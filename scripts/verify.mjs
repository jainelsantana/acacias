import assert from 'node:assert/strict';
import {
  initialContent,
  validateContent,
  safeUrl,
  validDate,
} from '../lib/content.ts';
const base = 'http://localhost:3000';
const check = (label) => process.stdout.write('PASS ' + label + '\n');
assert(validateContent(initialContent));
assert(!validDate('2026-02-30'));
assert(validDate('2028-02-29'));
for (const url of [
  'javascript:alert(1)',
  '//evil.example',
  'data:text/html,test',
  'https://user:pass@example.com',
])
  assert(!safeUrl(url));
assert(safeUrl('https://example.com/music'));
const bad = structuredClone(initialContent);
bad.video.youtubeId = 'invalid';
assert(!validateContent(bad));
const badImage = structuredClone(initialContent);
badImage.hero.image = 'https://example.com/photo.webp';
assert(!validateContent(badImage));
const badTarget = structuredClone(initialContent);
badTarget.releases[0].spotifyUrl = 'javascript:alert(1)';
assert(!validateContent(badTarget));
check(
  'Content schema rejects unsafe links, missing image descriptions and invalid video IDs',
);
for (const path of [
  '/',
  '/robots.txt',
  '/sitemap.xml',
  '/icon.svg',
  '/fonts/anton.woff2',
  '/fonts/dm-sans.woff2',
]) {
  const r = await fetch(base + path);
  assert.equal(r.status, 200, path);
}
check('Home, SEO endpoints and local font assets respond successfully');
const anonymous = await fetch(base + '/api/studio');
assert.equal(anonymous.status, 403);
const spoof = await fetch(base + '/api/studio', {
  headers: {
    'oai-authenticated-user-email': 'seedy@sites.test',
    'oai-authenticated-user-id': 'local_seedy',
  },
});
assert.equal(spoof.status, 403);
check('Editor API rejects anonymous visitors and spoofed identity headers');
const signIn = await fetch(base + '/signin-with-chatgpt?return_to=%2Fstudio', {
  redirect: 'manual',
});
const cookie = signIn.headers.get('set-cookie')?.split(';')[0];
assert(cookie);
const headers = {
  Cookie: cookie,
  Origin: base,
  'Content-Type': 'application/json',
};
const before = await fetch(base + '/api/studio', { headers });
assert.equal(before.status, 200);
const original = await before.json();
const draft = structuredClone(original.content);
draft.hero.signature = 'Verificação local de persistência';
const save = await fetch(base + '/api/studio', {
  method: 'PUT',
  headers,
  body: JSON.stringify({ content: draft, version: original.version }),
});
assert.equal(save.status, 200);
const saved = await save.json();
const after = await (await fetch(base + '/api/studio', { headers })).json();
assert.equal(after.content.hero.signature, draft.hero.signature);
const stale = await fetch(base + '/api/studio', {
  method: 'PUT',
  headers,
  body: JSON.stringify({ content: draft, version: original.version }),
});
assert.equal(stale.status, 409);
const restore = await fetch(base + '/api/studio', {
  method: 'PUT',
  headers,
  body: JSON.stringify({ content: original.content, version: saved.version }),
});
assert.equal(restore.status, 200);
const crossOrigin = await fetch(base + '/api/studio', {
  method: 'PUT',
  headers: { ...headers, Origin: 'https://other.example' },
  body: JSON.stringify({ content: original.content, version: saved.version }),
});
assert.equal(crossOrigin.status, 403);
check(
  'Authorized editing persists, rejects stale writes and blocks cross-origin writes',
);
const booking = {
  name: 'Verificação local',
  company: 'Teste',
  city: 'Teresina / PI',
  event: 'Teste de integração — não é um show real',
  date: '',
  phone: '',
  email: 'verify@example.invalid',
  message: 'Registro local para verificar o formulário. Não publicar.',
  website: '',
};
async function send(body, origin = base) {
  return fetch(base + '/api/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(body),
  });
}
assert.equal((await send({ ...booking, email: 'inválido' })).status, 400);
assert.equal((await send({ ...booking, website: 'spam' })).status, 400);
assert.equal((await send(booking, 'https://other.example')).status, 403);
assert.equal((await send(booking)).status, 201);
const messages = await (await fetch(base + '/api/studio', { headers })).json();
assert(
  messages.messages.some(
    (m) => m.email === booking.email && m.event === booking.event,
  ),
);
check(
  'Booking validates fields, blocks spam/cross-origin requests and stores a real inquiry',
);
console.log(
  'All checks passed. Test records exist only in the local D1 database.',
);
