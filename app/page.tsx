import { readContent } from '@/lib/site-data';
import { siteOrigin } from '@/lib/content';
import BandHome from '@/components/band-home';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const content = await readContent();
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MusicGroup',
        '@id': siteOrigin + '/#banda',
        name: 'Acácias',
        url: siteOrigin,
        foundingLocation: { '@type': 'Place', name: 'Teresina, Piauí, Brasil' },
        genre: [
          'MPB contemporânea',
          'Dream Pop',
          'Indie Pop',
          'Música brasileira',
        ],
        sameAs: content.socials.map((s) => s.url).filter(Boolean),
        album: content.releases.map((r) => ({
          '@id': siteOrigin + '/#' + r.id,
        })),
      },
      ...content.releases.map((r) => ({
        '@type': 'MusicAlbum',
        '@id': siteOrigin + '/#' + r.id,
        name: r.title,
        byArtist: { '@id': siteOrigin + '/#banda' },
        ...(r.year ? { datePublished: r.year } : {}),
        ...(r.cover ? { image: r.cover } : {}),
      })),
      ...content.shows
        .filter((s) => s.date >= new Date().toISOString().slice(0, 10))
        .map((s) => ({
          '@type': 'MusicEvent',
          name: s.event,
          startDate: s.date + (s.time ? 'T' + s.time + ':00-03:00' : ''),
          location: { '@type': 'Place', name: s.venue, address: s.city },
          performer: { '@id': siteOrigin + '/#banda' },
          ...(s.ticketUrl ? { url: s.ticketUrl } : {}),
        })),
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
        }}
      />
      <BandHome content={content} />
    </>
  );
}
