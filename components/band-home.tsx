'use client';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Plus,
  Menu,
  X,
  Download,
  Disc3,
  Check,
  LoaderCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  platformFields,
  platformLabels,
  type SiteContent,
  type Release,
} from '@/lib/content';

const nav = [
  ['Sobre', 'sobre'],
  ['Música', 'musica'],
  ['Vídeos', 'videos'],
  ['Agenda', 'agenda'],
  ['Galeria', 'galeria'],
  ['Press Kit', 'imprensa'],
  ['Contato', 'contato'],
];
const outbound = { target: '_blank', rel: 'noopener noreferrer' };
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}
function Pending({ children }: { children: React.ReactNode }) {
  return (
    <span className="pending">
      <span aria-hidden="true" /> {children}
    </span>
  );
}
function External({
  href,
  children,
  className = 'text-link',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} {...outbound} className={className}>
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
function PhotoSlot({
  label,
  number = '01',
  className = '',
}: {
  label: string;
  number?: string;
  className?: string;
}) {
  return (
    <div
      className={'photo-slot ' + className}
      role="img"
      aria-label={label + ' — material oficial pendente'}
    >
      <span className="slot-cross slot-cross-first">+</span>
      <span className="slot-cross slot-cross-last">+</span>
      <span className="slot-index">{number}</span>
      <div className="slot-caption">
        <span>{label}</span>
        <span>MATERIAL OFICIAL A INSERIR</span>
      </div>
    </div>
  );
}
function Cover({
  release,
  className = '',
}: {
  release?: Release;
  className?: string;
}) {
  return release?.cover ? (
    <img
      src={release.cover}
      alt={'Capa de ' + release.title}
      width={720}
      height={720}
      loading="lazy"
      decoding="async"
      className={'cover-image ' + className}
    />
  ) : (
    <div className={'cover-placeholder ' + className}>
      <span className="eyebrow">
        ACÁCIAS / {release?.format || 'NOVO LANÇAMENTO'}
      </span>
      <Disc3 className="cover-disc" aria-hidden="true" strokeWidth={0.65} />
      <span className="cover-placeholder-label">
        CAPA OFICIAL
        <br />A INSERIR
      </span>
      <span className="cover-foot">
        {release?.title || 'O próximo play.'}
        <Plus size={22} />
      </span>
    </div>
  );
}
function Platforms({ release }: { release: Release }) {
  const links = platformFields.flatMap((field, i) =>
    release[field] ? [{ url: release[field], label: platformLabels[i] }] : [],
  );
  return links.length ? (
    <div className="platform-links">
      {links.map((l) => (
        <External key={l.label} href={l.url}>
          {l.label}
        </External>
      ))}
    </div>
  ) : (
    <Pending>Links oficiais em breve</Pending>
  );
}
type Overlay =
  | { type: 'release'; release: Release }
  | { type: 'video' }
  | { type: 'gallery'; index: number }
  | null;

export default function BandHome({ content: c }: { content: SiteContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [archive, setArchive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const featured = c.releases.find((r) => r.id === c.featuredId);
  const instagram = c.socials.find(
    (s) => s.label.toLowerCase() === 'instagram',
  );
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo',
  });
  const upcoming = c.shows
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = c.shows
    .filter((s) => s.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const shown = archive ? past : upcoming;
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 70);
    scroll();
    window.addEventListener('scroll', scroll, { passive: true });
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements.forEach((e) => observer.observe(e));
    return () => {
      window.removeEventListener('scroll', scroll);
      observer.disconnect();
    };
  }, []);
  const changePhoto = (delta: number) =>
    setOverlay((o) =>
      o?.type === 'gallery'
        ? {
            type: 'gallery',
            index: (o.index + delta + c.gallery.length) % c.gallery.length,
          }
        : o,
    );
  useEffect(() => {
    if (overlay?.type !== 'gallery') return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        changePhoto(1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changePhoto(-1);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [overlay?.type, c.gallery.length]);
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header
        className={
          'site-header ' +
          (scrolled ? 'scrolled ' : '') +
          (c.hero.image && !scrolled ? 'over-photo' : '')
        }
      >
        <a
          href="#inicio"
          className="small-wordmark"
          aria-label="Acácias — início"
        >
          ACÁCIAS<span aria-hidden="true">✳</span>
        </a>
        <nav aria-label="Navegação principal" className="desktop-nav">
          {nav.map(([name, id]) => (
            <a key={id} href={'#' + id}>
              {name}
            </a>
          ))}
        </nav>
        <a href="#musica" className="header-cta">
          OUÇA AGORA
          <ArrowUpRight size={16} />
        </a>
        <button
          className="menu-button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </button>
      </header>
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="mobile-menu" showCloseButton={false}>
          <div className="mobile-menu-top">
            <DialogTitle className="small-wordmark">ACÁCIAS</DialogTitle>
            <DialogClose className="round-button" aria-label="Fechar menu">
              <X />
            </DialogClose>
          </div>
          <DialogDescription className="sr-only">
            Navegue pelas seções do site.
          </DialogDescription>
          <nav aria-label="Navegação mobile">
            {nav.map(([name, id], i) => (
              <a key={id} href={'#' + id} onClick={() => setMenuOpen(false)}>
                <span className="eyebrow">0{i + 1}</span>
                {name}
                <ArrowUpRight />
              </a>
            ))}
          </nav>
          <p className="eyebrow">TERESINA, PIAUÍ · BRASIL</p>
        </DialogContent>
      </Dialog>
      <main id="conteudo">
        <section
          className={'hero ' + (c.hero.image ? 'has-image' : '')}
          id="inicio"
          aria-labelledby="hero-title"
        >
          {c.hero.image && (
            <img
              className="hero-photo"
              src={c.hero.image}
              alt={c.hero.alt}
              width={1920}
              height={1280}
              fetchPriority="high"
              decoding="async"
            />
          )}
          <div className="hero-top">
            <Tag>TERESINA, PIAUÍ · BRASIL</Tag>
            <Tag>INDEPENDENTE POR NATUREZA</Tag>
          </div>
          <h1 className="hero-wordmark" id="hero-title">
            ACÁCIAS
          </h1>
          <div className="hero-bottom">
            <div className="hero-signature">
              <span className="hero-asterisk" aria-hidden="true">
                ✳
              </span>
              <div>
                <p>
                  {c.hero.signature === 'Música para sentir de perto.' ? (
                    <>
                      Música para
                      <br />
                      <em>sentir de perto.</em>
                    </>
                  ) : (
                    c.hero.signature
                  )}
                </p>
                {!c.hero.signatureApproved && (
                  <span className="micro-note">
                    ASSINATURA PROPOSTA · EM VALIDAÇÃO
                  </span>
                )}
              </div>
            </div>
            <div className="hero-actions">
              <a href="#musica" className="button button-blue">
                OUÇA ACÁCIAS
                <ArrowUpRight size={20} />
              </a>
              <a href="#sobre" className="text-link">
                CONHEÇA A BANDA
                <ArrowDown size={18} />
              </a>
            </div>
          </div>
          <div className="hero-baseline">
            <span>
              {c.hero.image
                ? c.hero.credit
                : 'ESPAÇO RESERVADO PARA FOTOGRAFIA OFICIAL'}
            </span>
            <a href="#sobre">
              SINTA. ESCUTE. FIQUE.
              <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <div className="ticker" aria-hidden="true">
          <div>
            {[0, 1].map((n) => (
              <span key={n}>
                MPB CONTEMPORÂNEA <i>✳</i> DREAM POP <i>✳</i> AFETO EM FORMA DE
                SOM <i>✳</i> FEITO NO PIAUÍ <i>✳</i>{' '}
              </span>
            ))}
          </div>
        </div>
        <section id="sobre" className="manifesto section-pad">
          <div className="section-top">
            <Tag>01 / NOSSO UNIVERSO</Tag>
            <span className="eyebrow">A MÚSICA É O NOSSO ENCONTRO.</span>
          </div>
          <div className="manifesto-grid">
            <h2 className="display reveal">
              ENTRE
              <br />O SONHO
              <br />
              <span className="serif">e a canção.</span>
            </h2>
            <div className="manifesto-side reveal">
              <figure>
                {c.manifesto.image ? (
                  <img
                    src={c.manifesto.image}
                    alt={c.manifesto.alt}
                    width={800}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <PhotoSlot
                    label="RETRATO DA BANDA"
                    className="manifesto-photo"
                  />
                )}
                {c.manifesto.credit && (
                  <figcaption>{c.manifesto.credit}</figcaption>
                )}
              </figure>
              <p className="body-copy">{c.manifesto.text}</p>
              {!c.manifesto.approved && (
                <Pending>
                  Manifesto proposto · aprovação da banda pendente
                </Pending>
              )}
            </div>
          </div>
          <p className="manifesto-foot">
            BRASILEIRA. INDEPENDENTE. <em>DE PERTO.</em>
          </p>
        </section>
        <section id="musica" className="featured section-pad">
          <div className="section-top">
            <Tag>02 / AUMENTE O VOLUME</Tag>
            <span className="eyebrow">DÊ PLAY. DEIXE SENTIR.</span>
          </div>
          <div className="featured-grid">
            <div className="featured-art reveal">
              <Cover release={featured} />
              {featured?.coverCredit && (
                <p className="image-credit">{featured.coverCredit}</p>
              )}
              <span className="record-stamp" aria-hidden="true">
                FEITO
                <br />
                PARA
                <br />
                <em>sentir</em>↗
              </span>
            </div>
            <div className="featured-copy reveal">
              <Tag>LANÇAMENTO EM DESTAQUE</Tag>
              <h2 className="display">
                {featured ? (
                  featured.title
                ) : (
                  <>
                    O PRÓXIMO
                    <br />
                    <span className="serif">play.</span>
                  </>
                )}
              </h2>
              {featured ? (
                <>
                  <p className="eyebrow">
                    {featured.format}
                    {featured.year ? ' · ' + featured.year : ''}
                  </p>
                  {featured.description && (
                    <p className="body-copy">{featured.description}</p>
                  )}
                  <Platforms release={featured} />
                  <button
                    className="text-link"
                    onClick={() =>
                      setOverlay({ type: 'release', release: featured })
                    }
                  >
                    EXPLORE O LANÇAMENTO
                    <ArrowUpRight size={18} />
                  </button>
                  {featured.previewUrl && (
                    <audio
                      controls
                      preload="none"
                      src={featured.previewUrl}
                      aria-label={'Prévia de ' + featured.title}
                    />
                  )}
                </>
              ) : (
                <>
                  <p className="body-copy">
                    Um espaço para a próxima canção que vai ficar com você.
                  </p>
                  <Pending>Lançamento e plataformas a confirmar</Pending>
                  <a className="button button-yellow" href="#discografia">
                    EXPLORE A DISCOGRAFIA
                    <ArrowDown size={20} />
                  </a>
                </>
              )}
            </div>
          </div>
        </section>
        <section id="discografia" className="discography section-pad">
          <div className="section-top">
            <Tag>O QUE JÁ VIROU CANÇÃO</Tag>
            <span className="eyebrow">DISCOGRAFIA / ACÁCIAS</span>
          </div>
          <div className="section-heading">
            <h2 className="display reveal">
              PARA LEVAR
              <br />
              <span className="serif">com você.</span>
            </h2>
            <p>
              Outras formas de
              <br />
              encontrar a gente.
            </p>
          </div>
          <div className="release-grid">
            {c.releases.map((r, i) => (
              <article
                className={'release reveal release-' + (i % 3)}
                key={r.id}
                id={r.id}
              >
                <button
                  className="release-cover-button"
                  onClick={() => setOverlay({ type: 'release', release: r })}
                  aria-label={'Ver detalhes de ' + r.title}
                >
                  <Cover release={r} />
                  <span className="release-open">
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </button>
                <div className="release-caption">
                  <div>
                    <h3>{r.title}</h3>
                    <span className="eyebrow">
                      {r.format}
                      {r.year ? ' / ' + r.year : ''}
                    </span>
                  </div>
                  <button
                    className="round-button"
                    onClick={() => setOverlay({ type: 'release', release: r })}
                    aria-label={'Abrir ' + r.title}
                  >
                    <Plus />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="videos" className="video-section section-pad">
          <div className="section-top">
            <Tag>03 / SOM QUE VIRA IMAGEM</Tag>
            <span className="eyebrow">APERTE O PLAY. ENTRE NA CENA.</span>
          </div>
          <div className="video-heading">
            <h2 className="display reveal">
              ASSISTA
              <br />
              <span className="outline-type">ACÁCIAS.</span>
            </h2>
            <span className="video-flower" aria-hidden="true">
              ✳
            </span>
          </div>
          <button
            className="video-stage reveal"
            onClick={() => setOverlay({ type: 'video' })}
            aria-label={
              c.video.youtubeId
                ? 'Assistir ' + c.video.title
                : 'Ver informações do videoclipe ' + c.video.title
            }
          >
            {c.video.image ? (
              <img
                src={c.video.image}
                alt={'Cena do videoclipe ' + c.video.title}
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="video-placeholder">
                <span className="eyebrow">FRAME OFICIAL A INSERIR</span>
                <span className="video-placeholder-word" aria-hidden="true">
                  SOM
                  <br />
                  <em>& imagem.</em>
                </span>
              </div>
            )}
            <span className="play-button">
              <Play fill="currentColor" size={28} />
            </span>
            <span className="video-stage-bottom">
              <span>{c.video.title}</span>
              <span className="eyebrow">
                {c.video.youtubeId
                  ? 'ASSISTIR AO CLIPE ↗'
                  : 'VÍDEO OFICIAL · LINK PENDENTE'}
              </span>
            </span>
          </button>
          {c.video.credit && <p className="image-credit">{c.video.credit}</p>}
        </section>
        <section id="agenda" className="agenda section-pad">
          <div className="section-top">
            <Tag>04 / A GENTE SE VÊ</Tag>
            <span className="eyebrow">MÚSICA FICA MELHOR JUNTO.</span>
          </div>
          <div className="section-heading">
            <h2 className="display reveal">
              PRÓXIMOS
              <br />
              <span className="serif">encontros.</span>
            </h2>
            {past.length > 0 && (
              <button
                className="text-link"
                onClick={() => setArchive(!archive)}
              >
                {archive ? 'PRÓXIMOS SHOWS' : 'VER ARQUIVO'}
                <ArrowUpRight size={18} />
              </button>
            )}
          </div>
          {shown.length ? (
            <div className="show-list">
              {shown.map((s) => (
                <article className="show-row" key={s.id}>
                  <time dateTime={s.date} className="show-date">
                    <strong>{s.date.slice(8, 10)}</strong>
                    <span>
                      {new Date(s.date + 'T12:00:00')
                        .toLocaleDateString('pt-BR', { month: 'short' })
                        .replace('.', '')}
                    </span>
                  </time>
                  <div>
                    <h3>{s.city}</h3>
                    <p>{s.event}</p>
                  </div>
                  <div>
                    <p>{s.venue}</p>
                    <span>{s.time || 'Horário a confirmar'}</span>
                  </div>
                  {s.ticketUrl ? (
                    <External
                      href={s.ticketUrl}
                      className="button button-outline"
                    >
                      {archive ? 'DETALHES' : 'INGRESSOS'}
                    </External>
                  ) : (
                    <span className="eyebrow">
                      {archive ? 'REALIZADO' : 'DETALHES EM BREVE'}
                    </span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="agenda-empty reveal">
              <span className="agenda-symbol" aria-hidden="true">
                ↗
              </span>
              <div>
                <h3>Novas datas em breve.</h3>
                <p>O próximo encontro ainda está sendo escrito.</p>
              </div>
              {instagram ? (
                <External
                  href={instagram.url}
                  className="button button-outline"
                >
                  ACOMPANHE NO INSTAGRAM
                </External>
              ) : (
                <a href="#contato" className="button button-outline">
                  LEVE ACÁCIAS AO SEU PALCO
                  <ArrowUpRight size={20} />
                </a>
              )}
            </div>
          )}
        </section>
        <section id="galeria" className="gallery section-pad">
          <div className="section-top">
            <Tag>05 / PARA ALÉM DO SOM</Tag>
            <span className="eyebrow">FRAGMENTOS DO NOSSO UNIVERSO</span>
          </div>
          <h2 className="display reveal">
            O QUE A GENTE
            <br />
            <span className="serif">guarda.</span>
          </h2>
          <div className="gallery-grid">
            {c.gallery.length ? (
              c.gallery.map((p, i) => (
                <figure
                  className={
                    'gallery-item gallery-item-' +
                    (i % 3) +
                    ' ' +
                    p.orientation +
                    ' reveal'
                  }
                  key={p.id}
                >
                  <button
                    onClick={() => setOverlay({ type: 'gallery', index: i })}
                    aria-label={'Ampliar: ' + p.alt}
                  >
                    <img
                      src={p.src}
                      alt={p.alt}
                      width={p.orientation === 'portrait' ? 800 : 1200}
                      height={p.orientation === 'portrait' ? 1100 : 800}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="gallery-expand">
                      <Plus />
                    </span>
                  </button>
                  <figcaption>
                    <span>
                      {String(i + 1).padStart(2, '0')} / {p.alt}
                    </span>
                    {p.credit && <span>{p.credit}</span>}
                  </figcaption>
                </figure>
              ))
            ) : (
              <>
                <figure className="gallery-item gallery-item-0 reveal">
                  <PhotoSlot label="ENCONTROS" number="01" />
                  <figcaption>01 / Fotografia autorizada pendente</figcaption>
                </figure>
                <figure className="gallery-item gallery-item-1 reveal">
                  <PhotoSlot label="DE PERTO" number="02" />
                  <figcaption>02 / Fotografia autorizada pendente</figcaption>
                </figure>
                <figure className="gallery-item gallery-item-2 reveal">
                  <PhotoSlot label="ENTRE CANÇÕES" number="03" />
                  <figcaption>03 / Fotografia autorizada pendente</figcaption>
                </figure>
              </>
            )}
          </div>
          <div className="gallery-note">
            <p>
              Tem coisa que fica
              <br />
              <em>mesmo depois do fim da música.</em>
            </p>
            {instagram && (
              <External href={instagram.url}>ACOMPANHE NO INSTAGRAM</External>
            )}
          </div>
        </section>
        <section id="banda" className="band section-pad">
          <div className="section-top">
            <Tag>06 / QUEM FAZ O SOM</Tag>
            <span className="eyebrow">ACÁCIAS · TERESINA, PI</span>
          </div>
          <div className="band-intro">
            <h2 className="display reveal">
              NO PLURAL.
              <br />
              <span className="serif">De coração.</span>
            </h2>
            <p className="body-copy">
              Vozes, encontros e sensibilidades.
              <br />
              Uma banda independente de Teresina, Piauí.
            </p>
          </div>
          {c.members.length ? (
            <div className="member-grid">
              {c.members.map((m, i) => (
                <figure key={m.id} className="member reveal">
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={m.name}
                      width={600}
                      height={800}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <PhotoSlot
                      label="RETRATO OFICIAL"
                      number={String(i + 1).padStart(2, '0')}
                    />
                  )}
                  <figcaption>
                    <h3>{m.name}</h3>
                    <p>{m.role}</p>
                    {m.credit && <small>{m.credit}</small>}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="members-pending">
              <span className="eyebrow">A BANDA</span>
              <p>
                Integrantes, funções e retratos oficiais
                <br />
                aguardando informações atualizadas da Acácias.
              </p>
              <Plus size={32} aria-hidden="true" />
            </div>
          )}
        </section>
        {c.news.length > 0 && (
          <section className="news section-pad">
            <div className="section-top">
              <Tag>NOTÍCIAS</Tag>
            </div>
            <h2 className="display">DAQUI PRA FORA.</h2>
            {c.news.map((n) => (
              <article className="news-row" key={n.id}>
                <time dateTime={n.date}>
                  {n.date
                    ? new Date(n.date + 'T12:00:00').toLocaleDateString('pt-BR')
                    : ''}
                </time>
                <External href={n.url}>{n.title}</External>
              </article>
            ))}
          </section>
        )}
        <section id="imprensa" className="press section-pad">
          <div className="section-top">
            <Tag>07 / VAMOS CONVERSAR</Tag>
            <span className="eyebrow">IMPRENSA · CURADORIA · PRODUÇÃO</span>
          </div>
          <div className="press-grid">
            <div>
              <h2 className="display reveal">
                PARA IMPRENSA
                <br />
                <span className="serif">& produção.</span>
              </h2>
              <p className="body-copy">
                Tudo para conhecer o projeto
                <br />e construir o próximo encontro.
              </p>
              {c.press.kitUrl ? (
                <External
                  href={c.press.kitUrl}
                  className="button button-yellow"
                >
                  BAIXAR PRESS KIT
                </External>
              ) : (
                <>
                  <button className="button button-yellow" disabled>
                    BAIXAR PRESS KIT
                    <Download size={20} />
                  </button>
                  <p className="micro-note">MATERIAL OFICIAL EM PREPARAÇÃO</p>
                </>
              )}
            </div>
            <div className="press-resources">
              {(
                [
                  ['Release & biografia', 'releaseUrl'],
                  ['Fotografias oficiais', 'photosUrl'],
                  ['Rider técnico', 'riderUrl'],
                  ['Mapa de palco', 'stageUrl'],
                ] as const
              ).map(([label, key], i) => (
                <div className="press-resource" key={key}>
                  <span className="eyebrow">0{i + 1}</span>
                  {c.press[key] ? (
                    <External href={c.press[key]}>{label}</External>
                  ) : (
                    <>
                      <span>{label}</span>
                      <span className="eyebrow">EM BREVE</span>
                    </>
                  )}
                </div>
              ))}
              <a href="#contato" className="text-link press-contact">
                FALE COM A PRODUÇÃO
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
        <section id="contato" className="contact section-pad">
          <div className="section-top">
            <Tag>08 / O PRÓXIMO PALCO</Tag>
            <span className="eyebrow">BOOKING & PARCERIAS</span>
          </div>
          <div className="contact-grid">
            <div className="contact-intro">
              <h2 className="display reveal">
                LEVE ACÁCIAS
                <br />
                PARA O<br />
                <span className="serif">seu palco.</span>
              </h2>
              <p className="body-copy">
                Festivais, casas de show, encontros.
                <br />
                Conte pra gente o que você está imaginando.
              </p>
              {c.contact.email ? (
                <a className="text-link" href={'mailto:' + c.contact.email}>
                  {c.contact.email}
                  <ArrowUpRight size={18} />
                </a>
              ) : (
                <Pending>E-mail profissional a confirmar</Pending>
              )}
              {c.contact.whatsapp && (
                <External
                  href={'https://wa.me/' + c.contact.whatsapp}
                  className="button button-blue"
                >
                  CONVERSAR NO WHATSAPP
                </External>
              )}
            </div>
            <BookingForm />
          </div>
        </section>
        <section className="social-strip">
          <p>
            A GENTE CONTINUA
            <br />
            <em>por aí.</em>
          </p>
          <div>
            {c.socials.length ? (
              c.socials
                .filter((s) => s.url)
                .map((s) => (
                  <External key={s.id} href={s.url}>
                    {s.label}
                  </External>
                ))
            ) : (
              <Pending>Redes e plataformas oficiais em breve</Pending>
            )}
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-top">
          <p>
            DE TERESINA, PIAUÍ.
            <br />
            PARA SENTIR DE PERTO.
          </p>
          <a href="#inicio" className="back-top">
            VOLTAR AO TOPO
            <ArrowUpRight size={20} />
          </a>
        </div>
        <a
          className="footer-wordmark"
          href="#inicio"
          aria-label="Acácias — voltar ao início"
        >
          ACÁCIAS
        </a>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ACÁCIAS</span>
          <span>MÚSICA BRASILEIRA INDEPENDENTE</span>
          <a href="#contato">
            CONTATO & BOOKING
            <ArrowUpRight size={14} />
          </a>
        </div>
        <p className="footer-credit">
          {(!c.hero.signatureApproved || !c.manifesto.approved) &&
            'Proposta visual e textos em validação. '}
          {(!c.hero.image || c.releases.some((r) => !r.cover)) &&
            'Fotografias ou capas oficiais aguardando envio. '}
          Créditos de fotografia e arte junto aos materiais.
        </p>
      </footer>
      <Dialog
        open={!!overlay}
        onOpenChange={(open) => {
          if (!open) setOverlay(null);
        }}
      >
        <DialogContent
          className={
            'media-dialog ' + (overlay?.type === 'gallery' ? 'lightbox' : '')
          }
          showCloseButton={false}
        >
          <DialogClose
            className="dialog-close round-button"
            aria-label="Fechar"
          >
            <X />
          </DialogClose>
          {overlay?.type === 'release' && (
            <>
              <DialogTitle className="dialog-title">
                {overlay.release.title}
              </DialogTitle>
              <DialogDescription>
                {overlay.release.format}
                {overlay.release.year ? ' · ' + overlay.release.year : ''} ·
                Acácias
              </DialogDescription>
              <div className="release-detail">
                <div>
                  <Cover release={overlay.release} />
                  {overlay.release.coverCredit && (
                    <p className="image-credit">
                      {overlay.release.coverCredit}
                    </p>
                  )}
                </div>
                <div>
                  {overlay.release.description && (
                    <p className="body-copy">{overlay.release.description}</p>
                  )}
                  {overlay.release.tracks ? (
                    <ol className="tracklist">
                      {overlay.release.tracks
                        .split('\n')
                        .filter(Boolean)
                        .map((t, i) => (
                          <li key={i}>
                            <span>{String(i + 1).padStart(2, '0')}</span>
                            {t}
                          </li>
                        ))}
                    </ol>
                  ) : (
                    <p className="detail-pending">
                      Ano, faixas e release oficial aguardando confirmação da
                      banda.
                    </p>
                  )}
                  <Platforms release={overlay.release} />
                  {overlay.release.previewUrl && (
                    <audio
                      controls
                      preload="none"
                      src={overlay.release.previewUrl}
                      aria-label={'Prévia de ' + overlay.release.title}
                    />
                  )}
                </div>
              </div>
            </>
          )}
          {overlay?.type === 'video' && (
            <>
              <DialogTitle className="dialog-title">
                {c.video.title}
              </DialogTitle>
              <DialogDescription>Videoclipe · Acácias</DialogDescription>
              {c.video.youtubeId ? (
                <iframe
                  className="video-iframe"
                  src={
                    'https://www.youtube-nocookie.com/embed/' +
                    c.video.youtubeId +
                    '?autoplay=1&rel=0'
                  }
                  title={c.video.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="video-unavailable">
                  <Play size={40} />
                  <h3>O filme chega em breve.</h3>
                  <p>
                    O link oficial deste videoclipe ainda não foi fornecido.
                  </p>
                </div>
              )}
            </>
          )}
          {overlay?.type === 'gallery' && (
            <>
              <DialogTitle className="dialog-title">
                {c.gallery[overlay.index].alt}
              </DialogTitle>
              <DialogDescription>
                {c.gallery[overlay.index].credit || 'Acácias · Galeria oficial'}
              </DialogDescription>
              <img
                className="lightbox-image"
                src={c.gallery[overlay.index].src}
                alt={c.gallery[overlay.index].alt}
              />
              <div className="lightbox-controls">
                <button
                  className="round-button"
                  onClick={() => changePhoto(-1)}
                  aria-label="Foto anterior"
                >
                  <ArrowLeft />
                </button>
                <span aria-live="polite">
                  {overlay.index + 1} / {c.gallery.length}
                </span>
                <button
                  className="round-button"
                  onClick={() => changePhoto(1)}
                  aria-label="Próxima foto"
                >
                  <ArrowRight />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function BookingForm() {
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    setError('');
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await res.json()) as { error?: string };
      if (!res.ok)
        throw new Error(
          result.error || 'Não foi possível registrar sua mensagem.',
        );
      setStatus('success');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof Error
          ? err.message
          : 'Verifique sua conexão e tente novamente.',
      );
    }
  }
  if (status === 'success')
    return (
      <div className="booking-success" role="status">
        <Check size={42} />
        <h3>
          Já temos um
          <br />
          <em>primeiro encontro.</em>
        </h3>
        <p>
          Sua solicitação foi registrada para a produção. Obrigado por imaginar
          esse palco com a Acácias.
        </p>
        <button className="text-link" onClick={() => setStatus('idle')}>
          ENVIAR OUTRA SOLICITAÇÃO
          <ArrowUpRight size={18} />
        </button>
      </div>
    );
  return (
    <form className="booking-form" onSubmit={submit}>
      <div className="form-intro">
        <Tag>CONTE SOBRE O SEU EVENTO</Tag>
        <span>* Campos obrigatórios</span>
      </div>
      <div className="form-grid">
        <label>
          Seu nome *
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            placeholder="Como podemos chamar você?"
          />
        </label>
        <label>
          Empresa / produção
          <input
            name="company"
            autoComplete="organization"
            maxLength={160}
            placeholder="Nome da produção"
          />
        </label>
        <label>
          Cidade *
          <input
            name="city"
            autoComplete="address-level2"
            required
            maxLength={120}
            placeholder="Cidade / UF"
          />
        </label>
        <label>
          Evento *
          <input
            name="event"
            required
            maxLength={200}
            placeholder="Qual é o encontro?"
          />
        </label>
        <label>
          Data prevista
          <input
            name="date"
            type="date"
            min={new Date().toLocaleDateString('en-CA', {
              timeZone: 'America/Sao_Paulo',
            })}
          />
        </label>
        <label>
          Telefone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="(00) 00000-0000"
          />
        </label>
        <label className="field-full">
          E-mail *
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="voce@producao.com.br"
          />
        </label>
        <label className="field-full">
          Sua mensagem *
          <textarea
            name="message"
            required
            maxLength={5000}
            rows={3}
            placeholder="Conte sobre o evento, o público e o que você tem em mente."
          />
        </label>
        <label className="honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="form-privacy">
        Seus dados serão usados pela produção para tratar esta solicitação.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error} Você pode tentar novamente sem perder o texto.
        </p>
      )}
      <button
        className="button button-blue form-submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? (
          <>
            REGISTRANDO SOLICITAÇÃO
            <LoaderCircle className="spin" size={20} />
          </>
        ) : (
          <>
            CONTRATAR ACÁCIAS
            <ArrowUpRight size={20} />
          </>
        )}
      </button>
    </form>
  );
}
