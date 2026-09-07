# ACÁCIAS

Site editorial da banda Acácias, de Teresina, Piauí. React 19, TypeScript, Vinext (API compatível com Next.js), Tailwind CSS, animações CSS e Cloudflare Workers/D1.

## Direção de arte

Uma revista musical em movimento: amarelo solar e azul profundo na abertura; creme no manifesto; azul no destaque; vinho no vídeo; amarelo na agenda; rosa nos integrantes. Anton dá escala aos títulos, Georgia introduz a voz poética, DM Sans sustenta a interface. As fontes são locais; não há requisições a Google Fonts durante a navegação.

## Wireframe e estrutura

1. Header fixo, menu de tela inteira no celular e abertura de aproximadamente uma tela.
2. Manifesto com composição tipográfica e fotografia editorial.
3. Lançamento selecionável no painel e discografia com detalhes em modal.
4. Videoclipe em player YouTube carregado apenas sob demanda.
5. Agenda com arquivo automático e estado sem novas datas.
6. Galeria assimétrica com ampliação, créditos e navegação por setas.
7. Integrantes, notícias opcionais, imprensa e materiais para produção.
8. Formulário de contratação, redes oficiais e rodapé monumental.

## Conteúdo e painel

Acesse `/studio` com o e-mail e a senha definidos para a produção. O painel permite editar a abertura, manifesto, lançamentos, vídeo, agenda, galeria, integrantes, press kit, contato, redes e notícias. Também permite consultar as últimas 100 solicitações. Os dados são persistidos em D1 e alterações de conteúdo não exigem reconstruir o site. A autorização é verificada no servidor por uma sessão própria; contas, cookies e cabeçalhos do ChatGPT não dão acesso ao CMS. Não há cadastro público de editores.

Para preparar o primeiro acesso local, aplique as migrações e execute `npm run studio:setup`. O comando gera um link local de uso único, válido por uma hora, onde a pessoa responsável escolhe seu e-mail e sua senha. O link só funciona enquanto não existir uma conta e não deve ser compartilhado. Senhas têm entre 15 e 128 caracteres e são persistidas apenas como hashes scrypt com salt individual (N=16384, r=8, p=5). Sessões aleatórias expiram em oito horas, são guardadas como hash no banco e usam cookie HttpOnly, SameSite=Strict e Secure em HTTPS. Sair revoga a sessão no servidor. Não há envio de e-mail nem recuperação automática de senha.

URLs de fotos e arquivos devem apontar para materiais autorizados em HTTPS ou arquivos locais em `/`. Prefira WebP/AVIF: capa quadrada até 1200 px; retrato até 1200 px; hero até 1920 px, preferencialmente abaixo de 250 KB. O painel recebe URLs, não uploads. Inclua a descrição acessível e o crédito. Um campo vazio mantém um aviso claro. Não use dados fictícios para preencher as lacunas.

`lib/content.ts` contém os dados iniciais e a validação compartilhada. O briefing forneceu os títulos Esconderijo, Portátil e Beijos Sonoros, Grandes Concertos. O perfil oficial indicado é [@oficialacacias](https://www.instagram.com/oficialacacias/). Por determinação do usuário, os prints enviados no chat foram totalmente retirados do site e não devem ser reutilizados como imagens, recortes ou ampliações.

`lib/instagram-content.ts` registra materiais oficiais. Duas fotografias foram baixadas diretamente do Instagram pelo navegador: [Aivlis cantando, de 10 de dezembro de 2025](https://www.instagram.com/oficialacacias/p/DSGa1KhjRKw/) (1440 × 1919 px; autoria fotográfica a confirmar) e [banda com o público no Palácio da Música, de 25 de agosto de 2024](https://www.instagram.com/oficialacacias/p/C_GZTRvPy0K/) (1440 × 960 px; fotografia de `@marisa.oliveiraa`). As legendas foram consultadas e resumidas em [docs/fontes-instagram.md](docs/fontes-instagram.md). São imagens diferentes dos ensaios no pátio e junto ao carro azul: os originais desses ensaios permanecem pendentes porque o carregamento das publicações antigas exige login.

A bio oficial confirma Teresina, atividade desde 2016 e as funções de Aivlis (voz), João Brandim (guitarra) e Cássio Carvalho (teclado). O [Linktree oficial](https://linktr.ee/bandacacias) fornece os links de Portátil nas plataformas, do clipe Pertencer e do canal da banda no YouTube. O relatório de fontes registra os destinos e as informações que ainda dependem de confirmação. Contatos, press kit e demais materiais ausentes continuam pendentes; os textos poéticos são propostas para aprovação.

Os retratos podem ser enquadrados no painel com `left`, `center` ou `right`, sem alterar o arquivo original. `node scripts/import-instagram.mjs --apply` preenche o conteúdo local com o material oficial registrado, preserva campos existentes e salva uma cópia anterior. Sem `--apply`, apenas informa as alterações propostas. Os scripts de conteúdo autenticam com `STUDIO_EMAIL` e `STUDIO_PASSWORD` fornecidos no ambiente do processo, ou com `STUDIO_SESSION_COOKIE`; não grave credenciais nos scripts nem no repositório.

As solicitações são armazenadas na aba Solicitações. Não há envio automático por e-mail ou WhatsApp. A confirmação aparece somente depois que o banco confirma o registro. Há validação no servidor, proteção de origem, campo antispam e limite de cinco tentativas por dez minutos. Respostas devem ser feitas pela produção usando o contato recebido.

## Desenvolvimento

Use Node.js 22.13+ e o npm do projeto.

Em um clone novo, instale as dependências, prepare o banco local e inicie o site:

```sh
git clone https://github.com/jainelsantana/acacias.git
cd acacias
npm ci
npm run db:migrate:local
npm run dev
```

Com o servidor aberto, use outro terminal para preparar seu acesso ao painel:

```sh
npm run studio:setup
```

Abra o link local emitido pelo comando e escolha seu e-mail e sua senha. O site fica em `http://localhost:3000` e o painel em `http://localhost:3000/studio`. O arquivo `wrangler.local.example.json` fornece os identificadores locais de desenvolvimento; não contém credenciais e não cria recursos de produção. Os scripts também aceitam uma configuração pessoal em `wrangler.local.json`, que continua fora do Git.

O banco, contas e sessões locais não são enviados ao GitHub. Um clone começa com o conteúdo inicial definido no código. Para conferir a compilação:

```sh
npm run build
npx tsc --noEmit
```

### Plataformas e vídeo

As capas de **Esconderijo** e **Portátil** usam os arquivos enviados para o site, convertidos em WebP com até 1200 px, sem recorte. Ficam em `public/images/acacias/*-capa.webp` e nos lançamentos do conteúdo inicial. A arte vertical de Portátil é exibida integralmente dentro do quadro quadrado. Os créditos de autoria permanecem vazios até serem informados; as URLs e os créditos continuam editáveis no Studio.

**Só Por Você** é o lançamento em destaque inicial (`featuredId: 'so-por-voce'`), com a capa enviada em `so-por-voce-capa.webp`. Formato específico, ano, descrição e links de streaming podem ser completados em **Studio → Lançamentos**; informações não fornecidas permanecem vazias e o formato provisório é apenas “Lançamento”.

Os cinco perfis oficiais ficam em `lib/instagram-content.ts` e no `initialContent.socials`. A Home consome `SiteContent`: o Studio controla os destinos da faixa social, do menu mobile e de **Ouça Acácias**. Os links de cada lançamento continuam separados dos perfis da banda e aparecem com ícones na discografia, no destaque e no modal.

Conteúdo já salvo em D1 permanece intacto. Para incluir os perfis novos em um site já configurado, use **Redes sociais → Adicionar canais oficiais ausentes** no Studio, revise os campos e salve. A ação preserva URLs editadas e reconhece registros com IDs gerados pelo painel. Remover uma rede continua removendo sua exibição pública; não há reposição automática nem migração do banco.

O vídeo inicial é [Pertencer](https://www.youtube.com/watch?v=UfwHebZTH9k), ID `UfwHebZTH9k`, com título confirmado nos metadados oficiais do YouTube. A imagem editada no Studio tem prioridade; sem ela, a thumbnail usa `maxresdefault`, depois `hqdefault` caso haja erro ou placeholder de baixa resolução, e finalmente a composição tipográfica existente. A área reserva proporção 16:9 em todas as telas. O iframe de privacidade do YouTube só é montado após o clique, sem autoplay. Vídeos previamente salvos também permanecem editáveis no Studio.

`SocialPlatformLink` e `PlatformIcon` reutilizam SVGs locais do [Simple Icons](https://github.com/simple-icons/simple-icons) (CC0), com a paleta da Acácias, foco visível e respeito à preferência de movimento. Não foi adicionada dependência de produção. Verifique a compatibilidade dos dados com `node --experimental-strip-types scripts/verify-platforms.mjs`.

Para alterações no banco, edite `db/schema.ts` e execute `npm run db:generate`. As migrações versionadas são aplicadas na publicação. Não reescreva migrações já publicadas.

Para verificar a autenticação antes de configurar a conta real, aplique as migrações D1 locais, inicie a prévia na porta 3000 e execute `npm run test:auth`. O teste recusa executar se já existir uma conta, cria credenciais temporárias, verifica concorrência no primeiro acesso, login, expiração, logout, bloqueios e salvamento autorizado, e remove suas contas e sessões ao terminar. Para a verificação geral após configurar a conta, forneça as credenciais no ambiente do processo e execute `node scripts/verify.mjs`; esse teste cria uma solicitação fictícia apenas na base local e restaura o conteúdo após verificar persistência.

## Publicação e limites

### Demonstração no GitHub Pages

O endereço de demonstração é https://jainelsantana.github.io/acacias/. A publicação usa GitHub Actions (`.github/workflows/pages.yml`), que executa `npm run build:pages` e envia somente `outputs/github-pages`. Em Settings → Pages, a origem deve ser **GitHub Actions**. As pastas raiz e `docs` contêm código e documentação, não o site compilado.

A demonstração reutiliza os componentes, estilos, fotos e animações do site, com o conteúdo editorial público definido no código. O HTML já contém a página antes do JavaScript carregar. O formulário de contato está disponível também no Pages: com o Instagram como único contato confirmado, ele prepara e copia a solicitação para o visitante enviar à banda. Se um WhatsApp ou e-mail for definido no conteúdo público, o formulário passa a preparar a mensagem nesse canal. A interface informa que o visitante precisa concluir o envio; não simula recebimento nem grava os dados no navegador. Se a cópia automática estiver bloqueada, o texto continua disponível para cópia manual.

Pages não executa o banco nem as APIs. O registro direto das solicitações no painel continua disponível na aplicação completa, que requer Workers/D1. Não são exportados contas, senhas, sessões, solicitações ou conteúdo privado do banco local.

### Aplicação completa

A prévia é privada, disponível à conta proprietária. Antes de tornar o site público, preencha os materiais oficiais, aprove os textos e revise fotos, créditos e contatos. O domínio em `lib/content.ts` alimenta canonical, sitemap e metadados. Atualize-o se adotar um domínio próprio.

A troca de autenticação foi aplicada e testada no ambiente local. A política de acesso da hospedagem é independente do login do painel e permanece inalterada. Uma publicação posterior deve aplicar as migrações e provisionar o primeiro acesso no banco hospedado; o comando `studio:setup` atua exclusivamente no banco local. O custo de autenticação deve ser validado no limite de CPU da hospedagem sem reduzir os parâmetros de proteção da senha.

As fontes são auto-hospedadas; mídias abaixo da abertura usam carregamento tardio; vídeos e áudio não carregam automaticamente; animações respeitam `prefers-reduced-motion`. O conteúdo principal é renderizado no servidor. Acessibilidade inclui landmarks, foco visível, labels, link de salto e modais com controle de foco. A integração de plataformas foi verificada no Chrome em 375, 430, 768, 1024 e 1440 px, incluindo menu, foco, movimento reduzido, modal e fallbacks da thumbnail. A edição no Studio foi verificada com respostas de API isoladas, sem alterar o banco. Não foi medida uma pontuação Lighthouse.

## Tokens

| Papel         | Valor     |
| ------------- | --------- |
| Amarelo solar | `#f3ef3b` |
| Azul profundo | `#192ec5` |
| Rosa          | `#f4a1bd` |
| Vinho         | `#461d37` |
| Verde-água    | `#a6dacf` |
| Creme         | `#f7f4e9` |
| Tinta         | `#24221e` |

Botões têm alvo confortável; o celular reorganiza as composições, exibe menu integral e mantém os controles acessíveis. Os ícones de interface vêm de Lucide e as marcas das plataformas usam SVGs locais do Simple Icons. O monograma do favicon é provisório, não um logo oficial.
