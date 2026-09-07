export const platformIds = [
  'instagram',
  'youtube',
  'spotify',
  'apple-music',
  'deezer',
] as const;
export type Platform = (typeof platformIds)[number];
export const listeningPlatforms: Platform[] = [
  'spotify',
  'apple-music',
  'deezer',
  'youtube',
];
export const platformNames: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  spotify: 'Spotify',
  'apple-music': 'Apple Music',
  deezer: 'Deezer',
};
type Social = { id: string; label: string; url: string };

// Studio entries may have UUIDs or edited labels. Recognize official hosts too.
export function identifyPlatform(social: Social): Platform | undefined {
  const normalize = (value: string) =>
    value.toLowerCase().replace(/[\s_-]/g, '');
  try {
    const host = new URL(social.url).hostname.replace(/^www\./, '');
    const hosts: Record<string, Platform> = {
      'instagram.com': 'instagram',
      'youtube.com': 'youtube',
      'music.youtube.com': 'youtube',
      'youtu.be': 'youtube',
      'open.spotify.com': 'spotify',
      'music.apple.com': 'apple-music',
      'deezer.com': 'deezer',
      'deezer.page.link': 'deezer',
    };
    if (hosts[host]) return hosts[host];
  } catch {
    // Labels and stable IDs still work for relative URLs accepted by the CMS.
  }
  return platformIds.find((id) =>
    [social.id, social.label].some(
      (value) => normalize(value) === normalize(id),
    ),
  );
}

export function platformAriaLabel(
  platform: Platform | undefined,
  label: string,
  subject = 'Acácias',
) {
  if (platform === 'instagram') return `Seguir ${subject} no Instagram`;
  if (platform === 'youtube') return `Assistir ${subject} no YouTube`;
  if (platform) return `Ouvir ${subject} no ${platformNames[platform]}`;
  return `Acessar ${subject} em ${label}`;
}

export function missingOfficialSocials(socials: Social[], defaults: Social[]) {
  return defaults.filter(
    (official) =>
      !socials.some(
        (social) =>
          social.id === official.id ||
          identifyPlatform(social) === identifyPlatform(official),
      ),
  );
}
