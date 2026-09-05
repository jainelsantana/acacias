import { mkdir, writeFile } from 'node:fs/promises';
import { localStudioCookie } from './local-studio-session.mjs';
import {
  instagramMembers,
  instagramGallery,
  instagramManifesto,
  instagramProfile,
  officialYoutube,
  portatilLinks,
} from '../lib/instagram-content.ts';
import { validateContent } from '../lib/content.ts';

// Intentionally local-only. Uses the same e-mail/password session as the studio.
const base = 'http://localhost:3000';
const cookie = await localStudioCookie(base);
const headers = {
  Cookie: cookie,
  Origin: base,
  'Content-Type': 'application/json',
};
const res = await fetch(base + '/api/studio', { headers });
if (!res.ok) throw new Error('The content studio could not be read.');
const { content: original, version } = await res.json();
const content = structuredClone(original);
const changes = [];
const normalize = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
if (!content.manifesto.image && instagramManifesto.image) {
  Object.assign(content.manifesto, instagramManifesto);
  changes.push('Fotografia original de Portátil no manifesto');
}
for (const incoming of instagramMembers) {
  const member = content.members.find(
    (m) =>
      m.id === incoming.id || normalize(m.name) === normalize(incoming.name),
  );
  if (!member) {
    content.members.push(incoming);
    changes.push('Integrante: ' + incoming.name);
  } else if (!member.image && incoming.image) {
    member.image = incoming.image;
    member.imagePosition = incoming.imagePosition;
    member.credit ||= incoming.credit;
    changes.push('Retrato: ' + incoming.name);
  }
  if (member && !member.role && incoming.role) {
    member.role = incoming.role;
    changes.push('Função confirmada na bio: ' + incoming.name);
  }
}
for (const incoming of instagramGallery) {
  if (
    !content.gallery.some((p) => p.id === incoming.id || p.src === incoming.src)
  ) {
    content.gallery.push(incoming);
    changes.push('Galeria: ' + incoming.id);
  }
}
const instagram = content.socials.find(
  (s) => s.id === 'instagram' || normalize(s.label) === 'instagram',
);
if (!instagram) {
  content.socials.push(instagramProfile);
  changes.push('Perfil oficial do Instagram');
} else if (!instagram.url) {
  instagram.url = instagramProfile.url;
  changes.push('URL oficial do Instagram');
}
const youtube = content.socials.find(
  (s) => s.id === 'youtube' || normalize(s.label) === 'youtube',
);
if (!youtube) {
  content.socials.push(officialYoutube);
  changes.push('Canal oficial do YouTube');
} else if (!youtube.url) {
  youtube.url = officialYoutube.url;
  changes.push('URL oficial do YouTube');
}
const portatil = content.releases.find(
  (r) => r.id === 'portatil' || normalize(r.title) === 'portatil',
);
if (portatil) {
  for (const [key, value] of Object.entries(portatilLinks)) {
    if (!portatil[key]) {
      portatil[key] = value;
      changes.push('Portátil: ' + key);
    }
  }
}
if (!validateContent(content))
  throw new Error('Imported content failed validation.');
console.log(
  JSON.stringify({ changes, preservesExistingContent: true }, null, 2),
);
if (changes.length && process.argv.includes('--apply')) {
  await mkdir('artifacts/research', { recursive: true });
  const snapshot =
    'artifacts/research/content-before-instagram-' + Date.now() + '.json';
  await writeFile(
    snapshot,
    JSON.stringify({ content: original, version }, null, 2),
  );
  const saved = await fetch(base + '/api/studio', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content, version }),
  });
  if (!saved.ok) throw new Error(await saved.text());
  const checked = await (await fetch(base + '/api/studio', { headers })).json();
  if (
    !instagramMembers.every((m) =>
      checked.content.members.some(
        (c) => normalize(c.name) === normalize(m.name),
      ),
    )
  )
    throw new Error('Member verification failed.');
  console.log(
    'Conteúdo importado e conferido no painel local. Backup anterior: ' +
      snapshot,
  );
}
