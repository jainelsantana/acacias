'use client';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Plus,
  LoaderCircle,
  RotateCcw,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { SiteContent } from '@/lib/content';

type Field = [string, string, string?];
type Section = {
  key: keyof SiteContent;
  label: string;
  help: string;
  list?: boolean;
  fields: Field[];
};
const sections: Section[] = [
  {
    key: 'hero',
    label: 'Abertura',
    help: 'Use uma fotografia horizontal autorizada. A assinatura pode ser aprovada depois da revisão da banda.',
    fields: [
      ['signature', 'Assinatura'],
      ['image', 'URL da fotografia', 'url'],
      ['alt', 'Descrição da fotografia'],
      ['credit', 'Crédito da fotografia'],
    ],
  },
  {
    key: 'manifesto',
    label: 'Manifesto',
    help: 'O texto inicial é uma proposta. Revise e marque como aprovado antes do lançamento público.',
    fields: [
      ['text', 'Manifesto', 'textarea'],
      ['image', 'URL da fotografia', 'url'],
      ['alt', 'Descrição da fotografia'],
      ['credit', 'Crédito da fotografia'],
    ],
  },
  {
    key: 'releases',
    label: 'Lançamentos',
    list: true,
    help: 'Inclua somente informações confirmadas. Uma faixa por linha. Ative o destaque no lançamento que deverá aparecer primeiro.',
    fields: [
      ['title', 'Nome do lançamento'],
      ['format', 'Formato (single, EP ou álbum)'],
      ['year', 'Ano confirmado'],
      ['description', 'Descrição / release', 'textarea'],
      ['cover', 'URL da capa oficial', 'url'],
      ['coverCredit', 'Crédito da capa'],
      ['tracks', 'Faixas, uma por linha', 'textarea'],
      ['spotifyUrl', 'Spotify', 'url'],
      ['appleUrl', 'Apple Music', 'url'],
      ['youtubeUrl', 'YouTube', 'url'],
      ['deezerUrl', 'Deezer', 'url'],
      ['previewUrl', 'URL da prévia de áudio autorizada', 'url'],
    ],
  },
  {
    key: 'video',
    label: 'Videoclipe',
    help: 'Informe apenas o código de 11 caracteres do vídeo oficial do YouTube, disponível depois de v= no link. O player só carrega quando a pessoa clicar.',
    fields: [
      ['title', 'Título do videoclipe'],
      ['youtubeId', 'Código do YouTube'],
      ['image', 'URL do frame oficial', 'url'],
      ['credit', 'Crédito do frame'],
    ],
  },
  {
    key: 'shows',
    label: 'Agenda',
    list: true,
    help: 'Cadastre apenas shows confirmados. Datas passadas vão automaticamente para o arquivo.',
    fields: [
      ['date', 'Data', 'date'],
      ['city', 'Cidade / UF'],
      ['venue', 'Local'],
      ['event', 'Evento'],
      ['time', 'Horário', 'time'],
      ['ticketUrl', 'URL de ingressos ou detalhes', 'url'],
    ],
  },
  {
    key: 'gallery',
    label: 'Galeria',
    list: true,
    help: 'Use somente imagens autorizadas com descrição e créditos. Prefira arquivos WebP ou AVIF compactados. Orientação: portrait ou landscape.',
    fields: [
      ['src', 'URL da fotografia', 'url'],
      ['alt', 'Descrição da imagem'],
      ['credit', 'Crédito da fotografia'],
      ['orientation', 'Orientação'],
    ],
  },
  {
    key: 'members',
    label: 'Integrantes',
    list: true,
    help: 'Mantenha a formação atualizada. Informe os nomes e as funções confirmadas pela banda.',
    fields: [
      ['name', 'Nome'],
      ['role', 'Instrumento / função'],
      ['image', 'URL do retrato', 'url'],
      ['credit', 'Crédito do retrato'],
    ],
  },
  {
    key: 'press',
    label: 'Press Kit',
    help: 'Cole os links HTTPS dos arquivos oficiais. Um campo vazio aparece como material em preparação.',
    fields: [
      ['kitUrl', 'Press kit completo', 'url'],
      ['photosUrl', 'Fotografias em alta resolução', 'url'],
      ['releaseUrl', 'Release e biografia', 'url'],
      ['riderUrl', 'Rider técnico', 'url'],
      ['stageUrl', 'Mapa de palco', 'url'],
    ],
  },
  {
    key: 'contact',
    label: 'Contato',
    help: 'O WhatsApp deve conter somente números, incluindo país e DDD. As solicitações do formulário ficam na aba Solicitações, sem envio automático por e-mail.',
    fields: [
      ['email', 'E-mail de contratação', 'email'],
      ['whatsapp', 'WhatsApp com país e DDD'],
    ],
  },
  {
    key: 'socials',
    label: 'Redes sociais',
    list: true,
    help: 'Cadastre apenas URLs oficiais. Use os nomes Instagram, Spotify, YouTube, Apple Music, Deezer ou TikTok.',
    fields: [
      ['label', 'Nome da rede'],
      ['url', 'URL oficial', 'url'],
    ],
  },
  {
    key: 'news',
    label: 'Notícias',
    list: true,
    help: 'Adicione notícias ou matérias confirmadas. A seção só aparece na Home quando houver conteúdo.',
    fields: [
      ['title', 'Título'],
      ['date', 'Data', 'date'],
      ['url', 'Link da notícia', 'url'],
    ],
  },
];
type Inquiry = {
  id: string;
  name: string;
  company: string;
  city: string;
  event: string;
  date: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
};
type Payload = { content: SiteContent; version: string; messages: Inquiry[] };

export default function Studio() {
  const [data, setData] = useState<Payload | null>(null);
  const [active, setActive] = useState('hero');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [undo, setUndo] = useState<SiteContent | null>(null);
  const [loadError, setLoadError] = useState(false);
  async function load() {
    setLoadError(false);
    try {
      const res = await fetch('/api/studio', { cache: 'no-store' });
      if (!res.ok)
        throw new Error(
          'Não foi possível carregar. Verifique se sua conta está autorizada.',
        );
      const next = (await res.json()) as Payload;
      setData(next);
      setMessage('');
    } catch (e) {
      setLoadError(true);
      setMessage(e instanceof Error ? e.message : 'Falha ao carregar.');
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const before = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, [dirty]);
  function update(content: SiteContent) {
    setData((d) => (d ? { ...d, content } : d));
    setDirty(true);
    setMessage('Alterações ainda não salvas.');
  }
  function change(
    key: keyof SiteContent,
    field: string,
    value: string | boolean,
    index?: number,
  ) {
    if (!data) return;
    const next = structuredClone(data.content);
    if (index !== undefined)
      (next[key] as unknown as Record<string, unknown>[])[index][field] = value;
    else (next[key] as unknown as Record<string, unknown>)[field] = value;
    update(next);
  }
  function add(section: Section) {
    if (!data) return;
    const next = structuredClone(data.content);
    (next[section.key] as unknown as Record<string, string>[]).push({
      id: crypto.randomUUID(),
      ...Object.fromEntries(
        section.fields.map(([k]) => [
          k,
          k === 'orientation' ? 'landscape' : '',
        ]),
      ),
    });
    update(next);
  }
  function remove(section: Section, index: number) {
    if (!data) return;
    setUndo(structuredClone(data.content));
    const next = structuredClone(data.content);
    const items = next[section.key] as unknown as { id: string }[];
    if (section.key === 'releases' && items[index].id === next.featuredId)
      next.featuredId = '';
    items.splice(index, 1);
    update(next);
  }
  function move(section: Section, index: number, delta: number) {
    if (!data) return;
    const next = structuredClone(data.content);
    const items = next[section.key] as unknown as unknown[];
    [items[index], items[index + delta]] = [items[index + delta], items[index]];
    update(next);
  }
  async function save() {
    if (!data) return;
    setSaving(true);
    setMessage('Salvando…');
    try {
      const res = await fetch('/api/studio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content, version: data.version }),
      });
      const result = (await res.json()) as { version: string; error?: string };
      if (!res.ok) throw new Error(result.error);
      setData((d) => (d ? { ...d, version: result.version } : d));
      setDirty(false);
      setUndo(null);
      setMessage('Conteúdo salvo. As alterações já estão disponíveis no site.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }
  const section = sections.find((s) => s.key === active);
  const objects =
    data && section
      ? section.list
        ? (data.content[section.key] as unknown as Record<string, string>[])
        : [data.content[section.key] as unknown as Record<string, string>]
      : [];
  return (
    <main className="studio">
      <header className="studio-header">
        <div>
          <p className="eyebrow">ACÁCIAS / BASTIDORES</p>
          <h1>O site é de vocês.</h1>
        </div>
        <div className="studio-top-links">
          <a
            className="text-link"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            VER SITE
            <ArrowUpRight size={18} />
          </a>
          <a href="/signout-with-chatgpt?return_to=%2Fstudio" target="_top">
            Sair
          </a>
        </div>
      </header>
      {!data ? (
        <div role="status">
          <p>{message || 'Carregando o conteúdo…'}</p>
          {loadError && (
            <button className="text-link" onClick={() => void load()}>
              TENTAR NOVAMENTE ↗
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="studio-layout">
            <nav aria-label="Seções do painel" className="studio-nav">
              {sections.map((s) => (
                <button
                  key={s.key}
                  className={active === s.key ? 'active' : ''}
                  aria-current={active === s.key ? 'page' : undefined}
                  onClick={() => setActive(s.key)}
                >
                  {s.label}
                </button>
              ))}
              <button
                className={active === 'inquiries' ? 'active' : ''}
                onClick={() => setActive('inquiries')}
              >
                Solicitações ({data.messages.length})
              </button>
            </nav>
            <div className="studio-panel">
              {section ? (
                <>
                  <h2>{section.label}</h2>
                  <p className="studio-help">
                    {section.help} Fotografias, capas e arquivos devem estar
                    autorizados pela banda. Deixe campos desconhecidos vazios.
                  </p>
                  <fieldset
                    disabled={saving}
                    style={{ border: 0, padding: 0, minWidth: 0 }}
                  >
                    {objects.map((obj, index) => (
                      <div
                        key={obj.id || section.key}
                        className={section.list ? 'studio-item' : ''}
                      >
                        {section.list && (
                          <div className="studio-item-top">
                            <strong>
                              {index + 1}.{' '}
                              {obj.title ||
                                obj.name ||
                                obj.label ||
                                obj.event ||
                                obj.alt ||
                                'Novo item'}
                            </strong>
                            <div className="studio-item-actions">
                              <button
                                aria-label="Mover para cima"
                                disabled={index === 0}
                                onClick={() => move(section, index, -1)}
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                aria-label="Mover para baixo"
                                disabled={index === objects.length - 1}
                                onClick={() => move(section, index, 1)}
                              >
                                <ArrowDown size={16} />
                              </button>
                              <button
                                className="remove-item"
                                onClick={() => remove(section, index)}
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        )}
                        {section.fields.map(([key, label, type]) => (
                          <label className="studio-field" key={key}>
                            {label}
                            {type === 'textarea' ? (
                              <textarea
                                value={obj[key] || ''}
                                maxLength={12000}
                                onChange={(e) =>
                                  change(
                                    section.key,
                                    key,
                                    e.target.value,
                                    section.list ? index : undefined,
                                  )
                                }
                              />
                            ) : (
                              <input
                                type={type === 'url' ? 'text' : type || 'text'}
                                inputMode={type === 'url' ? 'url' : undefined}
                                maxLength={12000}
                                value={obj[key] || ''}
                                onChange={(e) =>
                                  change(
                                    section.key,
                                    key,
                                    e.target.value,
                                    section.list ? index : undefined,
                                  )
                                }
                              />
                            )}
                          </label>
                        ))}
                        {section.key === 'hero' && (
                          <label className="studio-check">
                            <Checkbox
                              checked={data.content.hero.signatureApproved}
                              onCheckedChange={(v) =>
                                change('hero', 'signatureApproved', v)
                              }
                            />
                            Assinatura aprovada pela banda
                          </label>
                        )}
                        {section.key === 'manifesto' && (
                          <label className="studio-check">
                            <Checkbox
                              checked={data.content.manifesto.approved}
                              onCheckedChange={(v) =>
                                change('manifesto', 'approved', v)
                              }
                            />
                            Manifesto aprovado pela banda
                          </label>
                        )}
                        {section.key === 'releases' && (
                          <label className="studio-check">
                            <Checkbox
                              checked={data.content.featuredId === obj.id}
                              onCheckedChange={(v) =>
                                update({
                                  ...data.content,
                                  featuredId: v ? obj.id : '',
                                })
                              }
                            />
                            Destacar este lançamento na Home
                          </label>
                        )}
                      </div>
                    ))}
                    {section.list && (
                      <button
                        className="button button-outline"
                        onClick={() => add(section)}
                      >
                        ADICIONAR ITEM
                        <Plus size={18} />
                      </button>
                    )}
                  </fieldset>
                </>
              ) : (
                <>
                  <h2>Solicitações de contratação</h2>
                  <p className="studio-help">
                    Últimas 100 solicitações recebidas. Os contatos ficam aqui
                    para a produção responder. Nenhuma mensagem é enviada
                    automaticamente por e-mail.
                  </p>
                  <button
                    className="text-link"
                    onClick={async () => {
                      try {
                        const r = await fetch('/api/studio', {
                          cache: 'no-store',
                        });
                        if (!r.ok) throw new Error();
                        const p = (await r.json()) as Payload;
                        setData((d) =>
                          d ? { ...d, messages: p.messages } : d,
                        );
                        setMessage('Solicitações atualizadas.');
                      } catch {
                        setMessage(
                          'Não foi possível atualizar as solicitações.',
                        );
                      }
                    }}
                  >
                    ATUALIZAR SOLICITAÇÕES
                    <RotateCcw size={16} />
                  </button>
                  {data.messages.length ? (
                    data.messages.map((m) => (
                      <article className="inquiry" key={m.id}>
                        <p className="eyebrow">
                          {new Date(m.created_at).toLocaleString('pt-BR', {
                            timeZone: 'America/Sao_Paulo',
                          })}
                        </p>
                        <h3>
                          {m.event} · {m.city}
                        </h3>
                        <p>
                          {m.name}
                          {m.company ? ' / ' + m.company : ''}
                        </p>
                        <p>
                          <a className="text-link" href={'mailto:' + m.email}>
                            {m.email}
                            <ArrowUpRight size={16} />
                          </a>
                        </p>
                        {m.phone && <p>Telefone: {m.phone}</p>}
                        {m.date && (
                          <p>
                            Data prevista:{' '}
                            {m.date.split('-').reverse().join('/')}
                          </p>
                        )}
                        <p className="inquiry-message">{m.message}</p>
                      </article>
                    ))
                  ) : (
                    <p className="studio-help" style={{ marginTop: 25 }}>
                      Nenhuma solicitação recebida por enquanto.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="studio-save">
            <p className="studio-message" role="status">
              {message ||
                (dirty ? 'Alterações não salvas.' : 'Conteúdo atualizado.')}
            </p>
            {undo && (
              <button
                className="text-link"
                disabled={saving}
                onClick={() => {
                  update(undo);
                  setUndo(null);
                }}
              >
                DESFAZER REMOÇÃO
                <RotateCcw size={16} />
              </button>
            )}
            <button
              className="button button-blue"
              disabled={!dirty || saving}
              onClick={() => void save()}
            >
              {saving ? 'SALVANDO…' : 'SALVAR ALTERAÇÕES'}
              {saving ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <ArrowUpRight size={18} />
              )}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
