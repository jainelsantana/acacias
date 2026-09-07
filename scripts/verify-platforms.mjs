import assert from 'node:assert/strict';
import { initialContent, validateContent } from '../lib/content.ts';
import { identifyPlatform, missingOfficialSocials } from '../lib/platforms.ts';

assert.ok(validateContent(initialContent));
assert.equal(initialContent.video.youtubeId, 'UfwHebZTH9k');
assert.equal(initialContent.socials.length, 5);
assert.deepEqual(initialContent.socials.map(identifyPlatform), [
  'instagram',
  'youtube',
  'spotify',
  'apple-music',
  'deezer',
]);

const saved = structuredClone(initialContent);
saved.socials = [
  {
    id: 'saved-instagram',
    label: 'Nosso Instagram',
    url: 'https://www.instagram.com/oficialacacias/',
  },
  {
    id: 'saved-spotify',
    label: 'Nosso som',
    url: 'https://open.spotify.com/artist/editor-selected',
  },
  { id: 'custom', label: 'Outra rede', url: 'https://example.com/' },
];
const before = structuredClone(saved);
assert.ok(validateContent(saved), 'Existing generic CMS records remain valid');
const missing = missingOfficialSocials(saved.socials, initialContent.socials);
assert.deepEqual(
  missing.map((social) => social.id),
  ['youtube', 'apple-music', 'deezer'],
);
assert.deepEqual(
  saved,
  before,
  'Reading missing defaults never mutates saved content',
);
saved.socials.push(...missing);
assert.ok(validateContent(saved));
assert.deepEqual(
  missingOfficialSocials(saved.socials, initialContent.socials),
  [],
  'Adding defaults is idempotent',
);
assert.equal(
  saved.socials[1].url,
  before.socials[1].url,
  'Editor URLs remain authoritative',
);
assert.equal(
  identifyPlatform({ id: 'uuid', label: 'APPLE MUSIC', url: '/music' }),
  'apple-music',
);
assert.equal(
  identifyPlatform({
    id: 'uuid',
    label: 'Other',
    url: 'https://open.spotify.com.example.com',
  }),
  undefined,
);
assert.equal(
  identifyPlatform({
    id: 'uuid',
    label: 'TikTok',
    url: 'https://www.tiktok.com/',
  }),
  undefined,
);
assert.notEqual(
  initialContent.releases.find((release) => release.id === 'portatil')
    .spotifyUrl,
  initialContent.socials.find((social) => social.id === 'spotify').url,
  'Artist and release destinations stay separate',
);
console.log(
  'Platforms: defaults, legacy CMS entries, editing, duplicate prevention and release links verified.',
);
