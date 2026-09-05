import type { Metadata } from 'next';
import { getChatGPTUser, chatGPTSignInPath } from '@/app/chatgpt-auth';
import { isEditor } from '@/lib/editor-auth';
import Studio from '@/components/studio';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Acácias — Painel de conteúdo',
  robots: { index: false, follow: false },
  alternates: { canonical: '/studio' },
};
export default async function StudioPage() {
  const user = await getChatGPTUser();
  if (!user || !(await isEditor()))
    return (
      <main className="studio-locked">
        <a href="/" className="small-wordmark">
          ACÁCIAS
        </a>
        <h1>Nos bastidores.</h1>
        <p>
          Este é o espaço da produção para atualizar o site e acompanhar
          solicitações de shows. O acesso é exclusivo para as contas
          autorizadas.
        </p>
        {!user ? (
          <a
            className="button button-blue"
            href={chatGPTSignInPath('/studio')}
            target="_top"
          >
            ENTRAR COM CHATGPT ↗
          </a>
        ) : (
          <>
            <p>Sua conta não está autorizada a editar este site.</p>
            <a
              href="/signout-with-chatgpt?return_to=%2Fstudio"
              target="_top"
              className="text-link"
            >
              TROCAR DE CONTA ↗
            </a>
          </>
        )}
        <p style={{ marginTop: 30 }}>
          <a href="/" className="text-link">
            VOLTAR PARA O SITE ↗
          </a>
        </p>
      </main>
    );
  return <Studio />;
}
