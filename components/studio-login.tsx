'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';

export default function StudioLogin() {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const readSetupLink = () => {
      const match = /^#setup=([a-f0-9]{64})$/.exec(window.location.hash);
      if (match) {
        setToken(match[1]);
        // Keep the one-use token out of subsequent URLs and browser history.
        window.history.replaceState(null, '', '/studio');
      }
    };
    readSetupLink();
    window.addEventListener('hashchange', readSetupLink);
    return () => window.removeEventListener('hashchange', readSetupLink);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get('email') || '');
    const password = String(fields.get('password') || '');
    if (token && password !== fields.get('confirmPassword')) {
      setError('As senhas precisam ser iguais.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        token ? '/api/auth/setup' : '/api/auth/login',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            ...(token ? { token } : {}),
          }),
        },
      );
      const result = (await response.json()) as {
        error?: string;
        ok?: boolean;
      };
      if (!response.ok) {
        setError(result.error || 'Não foi possível entrar.');
        return;
      }
      window.location.replace('/studio');
    } catch {
      setError(
        'Não foi possível conectar. Confira sua conexão e tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="studio-locked studio-login">
      <a
        href="/"
        className="small-wordmark"
        aria-label="Acácias — voltar ao site"
      >
        ACÁCIAS
      </a>
      <p className="eyebrow">PAINEL DE CONTEÚDO</p>
      <h1>{token ? 'Seu primeiro acesso.' : 'Entre nos bastidores.'}</h1>
      <p>
        {token
          ? 'Escolha o e-mail e a senha que você vai usar para cuidar do site.'
          : 'Use seu e-mail e sua senha para atualizar o site e acompanhar as solicitações de shows.'}
      </p>
      <form onSubmit={submit} className="studio-login-form" aria-busy={busy}>
        <label className="studio-field" htmlFor="studio-email">
          E-mail
          <input
            id="studio-email"
            name="email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
            disabled={busy}
          />
        </label>
        <label className="studio-field" htmlFor="studio-password">
          Senha
          <input
            id="studio-password"
            name="password"
            type="password"
            autoComplete={token ? 'new-password' : 'current-password'}
            minLength={token ? 15 : undefined}
            maxLength={128}
            required
            disabled={busy}
            aria-describedby={token ? 'password-hint' : undefined}
          />
          {token && (
            <small id="password-hint">
              Use pelo menos 15 caracteres. Uma frase fácil de lembrar funciona
              bem.
            </small>
          )}
        </label>
        {token && (
          <label className="studio-field" htmlFor="studio-confirm">
            Confirmar senha
            <input
              id="studio-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={15}
              maxLength={128}
              required
              disabled={busy}
            />
          </label>
        )}
        {error && (
          <p className="studio-login-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-blue" disabled={busy}>
          {busy ? (
            <LoaderCircle size={18} className="spin" aria-hidden="true" />
          ) : (
            <ArrowUpRight size={18} aria-hidden="true" />
          )}
          {busy ? 'AGUARDE…' : token ? 'CRIAR ACESSO E ENTRAR' : 'ENTRAR'}
        </button>
      </form>
      {token && (
        <button
          type="button"
          className="text-link"
          disabled={busy}
          onClick={() => {
            setToken('');
            setError('');
          }}
        >
          JÁ TENHO MEU ACESSO ↗
        </button>
      )}
      <a href="/" className="text-link studio-login-back">
        VOLTAR PARA O SITE ↗
      </a>
    </main>
  );
}
