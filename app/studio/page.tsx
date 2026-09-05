import type { Metadata } from 'next';
import { isEditor } from '@/lib/editor-auth';
import Studio from '@/components/studio';
import StudioLogin from '@/components/studio-login';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Acácias — Painel de conteúdo',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
  alternates: { canonical: '/studio' },
};
export default async function StudioPage() {
  if (!(await isEditor())) return <StudioLogin />;
  return <Studio />;
}
