// Original Instagram files only. Screenshot-derived assets were removed.
// See docs/fontes-instagram.md for post URLs, caption findings and pending sources.
export const instagramProfile = {
  id: 'instagram',
  label: 'Instagram',
  url: 'https://www.instagram.com/oficialacacias/',
};
export const officialYoutube = {
  id: 'youtube',
  label: 'YouTube',
  url: 'https://www.youtube.com/@acaciasbanda',
};
export const portatilLinks = {
  spotifyUrl: 'https://open.spotify.com/album/69KMbMubsnLZG8IFBUDqmc',
  appleUrl: 'https://music.apple.com/br/album/port%C3%A1til-ep/1755242472',
  youtubeUrl:
    'https://music.youtube.com/playlist?list=OLAK5uy_kvqmuuf-BwRDQ9nwjY8J_vgMmqMHCUYMc',
  deezerUrl: 'https://deezer.page.link/CkLz3sUwCes1Wzc26',
};
export const instagramManifesto = {
  image: '/images/acacias/portatil-publico-original.webp',
  alt: 'Acácias e seu público no Palácio da Música, no registro do show Portátil publicado em agosto de 2024.',
  credit: 'Foto: @marisa.oliveiraa · Instagram / @oficialacacias',
};
export const instagramMembers = [
  {
    id: 'aivlis-amorim',
    name: 'Aivlis Amorim',
    role: 'Voz',
    image: '/images/acacias/aivlis-ao-vivo-original.webp',
    imagePosition: 'center',
    credit: 'Fonte: @oficialacacias · autoria fotográfica a confirmar',
  },
  {
    id: 'joao-brandim',
    name: 'João Brandim',
    role: 'Guitarra',
    image: '',
    imagePosition: 'center',
    credit: '',
  },
  {
    id: 'cassio-carvalho',
    name: 'Cássio Carvalho',
    role: 'Teclado',
    image: '',
    imagePosition: 'center',
    credit: '',
  },
  {
    id: 'amadeu-alencar',
    name: 'Amadeu Alencar',
    role: '',
    image: '',
    imagePosition: 'center',
    credit: '',
  },
];
export const instagramGallery = [
  {
    id: 'portatil-publico-original',
    src: instagramManifesto.image,
    alt: instagramManifesto.alt,
    credit: instagramManifesto.credit,
    orientation: 'landscape',
  },
  {
    id: 'aivlis-ao-vivo-original',
    src: instagramMembers[0].image,
    alt: 'Aivlis Amorim cantando ao microfone, em fotografia publicada pela Acácias em dezembro de 2025.',
    credit: instagramMembers[0].credit,
    orientation: 'portrait',
  },
];
