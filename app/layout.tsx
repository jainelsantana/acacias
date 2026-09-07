import type { Metadata } from 'next';
import { siteOrigin } from '@/lib/content';
import './globals.css';
import './motion.css';
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'ACÁCIAS — Banda de Teresina, Piauí',
  description:
    'Conheça a Acácias: música independente de Teresina, Piauí. Explore os EPs Esconderijo e Portátil, vídeos, agenda e informações para contratação.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Acácias',
    title: 'ACÁCIAS — Música para sentir de perto',
    description:
      'MPB contemporânea, dream pop e música brasileira. De Teresina, Piauí.',
    url: siteOrigin,
  },
  twitter: {
    card: 'summary',
    title: 'ACÁCIAS — Banda de Teresina',
    description: 'MPB contemporânea, dream pop e música brasileira.',
  },
  icons: {
    icon: '/icon.png?v=2',
    apple: '/apple-icon.png?v=2',
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preload"
          href="/fonts/anton.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="icon" type="image/png" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />
      </head>
      <body>{children}</body>
    </html>
  );
}
