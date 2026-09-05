export const platformFields = [
  'spotifyUrl',
  'appleUrl',
  'youtubeUrl',
  'deezerUrl',
] as const;
export const platformLabels = ['Spotify', 'Apple Music', 'YouTube', 'Deezer'];
export type Release = {
  id: string;
  title: string;
  format: string;
  year: string;
  description: string;
  cover: string;
  coverCredit: string;
  tracks: string;
  spotifyUrl: string;
  appleUrl: string;
  youtubeUrl: string;
  deezerUrl: string;
  previewUrl: string;
};
export type Show = {
  id: string;
  date: string;
  city: string;
  venue: string;
  event: string;
  time: string;
  ticketUrl: string;
};
export type Photo = {
  id: string;
  src: string;
  alt: string;
  credit: string;
  orientation: string;
};
export type Member = {
  id: string;
  name: string;
  role: string;
  image: string;
  credit: string;
};
export type SiteContent = {
  hero: {
    signature: string;
    signatureApproved: boolean;
    image: string;
    alt: string;
    credit: string;
  };
  manifesto: {
    text: string;
    approved: boolean;
    image: string;
    alt: string;
    credit: string;
  };
  featuredId: string;
  releases: Release[];
  video: { title: string; youtubeId: string; image: string; credit: string };
  shows: Show[];
  gallery: Photo[];
  members: Member[];
  press: {
    kitUrl: string;
    photosUrl: string;
    releaseUrl: string;
    riderUrl: string;
    stageUrl: string;
  };
  contact: { email: string; whatsapp: string };
  socials: { id: string; label: string; url: string }[];
  news: { id: string; title: string; date: string; url: string }[];
};
const release = (id: string, title: string): Release => ({
  id,
  title,
  format: 'EP',
  year: '',
  description: '',
  cover: '',
  coverCredit: '',
  tracks: '',
  spotifyUrl: '',
  appleUrl: '',
  youtubeUrl: '',
  deezerUrl: '',
  previewUrl: '',
});
export const initialContent: SiteContent = {
  hero: {
    signature: 'Música para sentir de perto.',
    signatureApproved: false,
    image: '',
    alt: '',
    credit: '',
  },
  manifesto: {
    text: 'Tem coisa que só uma canção consegue dizer. Entre a MPB contemporânea, o dream pop e a música brasileira, a Acácias faz do afeto o seu ponto de encontro. De Teresina, Piauí, para sentir de perto.',
    approved: false,
    image: '',
    alt: '',
    credit: '',
  },
  featuredId: '',
  releases: [
    release('esconderijo', 'Esconderijo'),
    release('portatil', 'Portátil'),
  ],
  video: {
    title: 'Beijos Sonoros, Grandes Concertos',
    youtubeId: '',
    image: '',
    credit: '',
  },
  shows: [],
  gallery: [],
  members: [],
  press: {
    kitUrl: '',
    photosUrl: '',
    releaseUrl: '',
    riderUrl: '',
    stageUrl: '',
  },
  contact: { email: '', whatsapp: '' },
  socials: [],
  news: [],
};
export const siteOrigin = 'https://acacias-musica.jainel238801.chatgpt.site';
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function safeUrl(value: string) {
  return (
    !value ||
    /^\/(?!\/)[\w./%-]+$/.test(value) ||
    (/^https:\/\//.test(value) &&
      (() => {
        try {
          const u = new URL(value);
          return !u.username && !u.password;
        } catch {
          return false;
        }
      })())
  );
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const requiredKeys = (v: unknown, keys: string[]) =>
  record(v) &&
  keys.every(
    (k) => typeof v[k] === 'string' && (v[k] as string).length <= 12000,
  );
export function validateContent(v: unknown): v is SiteContent {
  if (!record(v) || typeof v.featuredId !== 'string') return false;
  if (
    !requiredKeys(v.hero, ['signature', 'image', 'alt', 'credit']) ||
    !record(v.hero) ||
    typeof v.hero.signatureApproved !== 'boolean'
  )
    return false;
  if (
    !requiredKeys(v.manifesto, ['text', 'image', 'alt', 'credit']) ||
    !record(v.manifesto) ||
    typeof v.manifesto.approved !== 'boolean'
  )
    return false;
  if (
    !requiredKeys(v.video, ['title', 'youtubeId', 'image', 'credit']) ||
    !requiredKeys(v.press, [
      'kitUrl',
      'photosUrl',
      'releaseUrl',
      'riderUrl',
      'stageUrl',
    ]) ||
    !requiredKeys(v.contact, ['email', 'whatsapp'])
  )
    return false;
  const lists: Record<string, string[]> = {
    releases: Object.keys(release('', '')),
    shows: ['id', 'date', 'city', 'venue', 'event', 'time', 'ticketUrl'],
    gallery: ['id', 'src', 'alt', 'credit', 'orientation'],
    members: ['id', 'name', 'role', 'image', 'credit'],
    socials: ['id', 'label', 'url'],
    news: ['id', 'title', 'date', 'url'],
  };
  for (const [key, fields] of Object.entries(lists)) {
    const items = v[key];
    if (
      !Array.isArray(items) ||
      items.length > 100 ||
      !items.every(
        (item) =>
          requiredKeys(item, fields) &&
          item.id &&
          fields.filter((f) => f !== 'id').some((f) => item[f]),
      )
    )
      return false;
    if (new Set(items.map((item) => item.id)).size !== items.length)
      return false;
  }
  const c = v as unknown as SiteContent;
  if (c.featuredId && !c.releases.some((r) => r.id === c.featuredId))
    return false;
  if (c.video.youtubeId && !/^[\w-]{11}$/.test(c.video.youtubeId)) return false;
  if (c.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.contact.email))
    return false;
  if (c.contact.whatsapp && !/^\d{10,15}$/.test(c.contact.whatsapp))
    return false;
  if ((c.hero.image && !c.hero.alt) || (c.manifesto.image && !c.manifesto.alt))
    return false;
  if (
    c.gallery.some((p) => !p.src || !p.alt) ||
    c.members.some((m) => !m.name || !m.role) ||
    c.releases.some((r) => !r.title || !r.format)
  )
    return false;
  if (
    c.shows.some(
      (s) =>
        !s.event ||
        !s.city ||
        !s.venue ||
        !validDate(s.date) ||
        (s.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)),
    )
  )
    return false;
  if (
    c.news.some((n) => !n.title || !n.url || (n.date && !validDate(n.date))) ||
    c.socials.some((s) => !s.label || !s.url)
  )
    return false;
  const checkUrls = (x: unknown): boolean =>
    !record(x)
      ? !Array.isArray(x) || x.every(checkUrls)
      : Object.entries(x).every(([key, val]) =>
          typeof val === 'string' && /url$|^image$|^src$|^cover$/i.test(key)
            ? safeUrl(val)
            : checkUrls(val),
        );
  return checkUrls(c);
}
