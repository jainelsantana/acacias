import { mkdir, writeFile } from 'node:fs/promises';
import { localStudioCookie } from './local-studio-session.mjs';
import { validateContent } from '../lib/content.ts';

const base = 'http://localhost:3000';
const rejected = new Set(
  ['aivlis-joao', 'cassio-amadeu', 'conhecendo-a-banda', 'encontro'].map(
    (n) => `/images/acacias/${n}.webp`,
  ),
);
const cookie = await localStudioCookie(base);
const headers = {
  Cookie: cookie,
  Origin: base,
  'Content-Type': 'application/json',
};
const response = await fetch(base + '/api/studio', { headers });
if (!response.ok) throw new Error('Local studio unavailable.');
const { content: original, version } = await response.json();
const content = structuredClone(original);
for (const section of [
  content.hero,
  content.manifesto,
  content.video,
  ...content.members,
]) {
  if (rejected.has(section.image)) {
    section.image = '';
    section.credit = '';
    if ('alt' in section) section.alt = '';
  }
}
content.gallery = content.gallery.filter((p) => !rejected.has(p.src));
if (!validateContent(content)) throw new Error('Invalid content.');
if (JSON.stringify(content) !== JSON.stringify(original)) {
  await mkdir('artifacts/research', { recursive: true });
  await writeFile(
    `artifacts/research/content-before-removing-screenshots-${Date.now()}.json`,
    JSON.stringify({ content: original, version }, null, 2),
  );
  const saved = await fetch(base + '/api/studio', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content, version }),
  });
  if (!saved.ok) throw new Error(await saved.text());
}
const checked = await (await fetch(base + '/api/studio', { headers })).json();
if ([...rejected].some((src) => JSON.stringify(checked.content).includes(src)))
  throw new Error('A screenshot reference remains.');
console.log('Prints removidos do conteúdo local. Demais campos preservados.');
