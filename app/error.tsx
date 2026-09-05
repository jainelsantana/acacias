'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="studio-locked">
      <a className="small-wordmark" href="/">
        ACÁCIAS
      </a>
      <h1>Uma pequena pausa.</h1>
      <p>
        Não conseguimos carregar o conteúdo agora. Tente novamente em instantes.
      </p>
      <button className="button button-blue" onClick={() => reset()}>
        TENTAR NOVAMENTE ↗
      </button>
    </main>
  );
}
