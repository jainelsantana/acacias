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

Acesse `/studio` com a conta ChatGPT autorizada. O painel permite editar a abertura, manifesto, lançamentos, vídeo, agenda, galeria, integrantes, press kit, contato, redes e notícias. Também permite consultar as últimas 100 solicitações. Os dados são persistidos em D1 e alterações de conteúdo não exigem reconstruir o site. A lista `EDITOR_EMAILS`, configurada no ambiente de produção, controla o acesso no servidor. Não há cadastro público de editores.

URLs de fotos e arquivos devem apontar para materiais autorizados em HTTPS ou arquivos locais em `/`. Prefira WebP/AVIF: capa quadrada até 1200 px; retrato até 1200 px; hero até 1920 px, preferencialmente abaixo de 250 KB. O painel recebe URLs, não uploads. Inclua a descrição acessível e o crédito. Um campo vazio mantém um aviso claro. Não use dados fictícios para preencher as lacunas.

`lib/content.ts` contém os dados iniciais e a validação compartilhada. Somente os títulos Esconderijo, Portátil e Beijos Sonoros, Grandes Concertos foram fornecidos. Não foram fornecidos fotografias, capas, integrantes, datas, faixas, perfis sociais, contatos ou press kit. Os textos poéticos são propostas sinalizadas para aprovação.

As solicitações são armazenadas na aba Solicitações. Não há envio automático por e-mail ou WhatsApp. A confirmação aparece somente depois que o banco confirma o registro. Há validação no servidor, proteção de origem, campo antispam e limite de cinco tentativas por dez minutos. Respostas devem ser feitas pela produção usando o contato recebido.

## Desenvolvimento

Use Node.js 22.13+ e o npm do projeto.

```sh
npm install
npm run dev
npm run build
npx tsc --noEmit
```

Para alterações no banco, edite `db/schema.ts` e execute `npm run db:generate`. As migrações versionadas são aplicadas na publicação. Não reescreva migrações já publicadas.

Para verificar localmente os fluxos, aplique a migração D1 local, configure `.dev.vars` com `EDITOR_EMAILS=seedy@sites.test`, inicie a prévia na porta 3000 e execute `node scripts/verify.mjs`. A identidade local de teste é fornecida pelo plugin Sites; ela nunca deve ser autorizada em produção. O teste cria apenas registros na base local e restaura o conteúdo após verificar persistência.

## Publicação e limites

A prévia é privada, disponível à conta proprietária. Antes de tornar o site público, preencha os materiais oficiais, aprove os textos e revise fotos, créditos e contatos. O domínio em `lib/content.ts` alimenta canonical, sitemap e metadados. Atualize-o se adotar um domínio próprio.

As fontes são auto-hospedadas; mídias abaixo da abertura usam carregamento tardio; vídeos e áudio não carregam automaticamente; animações respeitam `prefers-reduced-motion`. O conteúdo principal é renderizado no servidor. Acessibilidade inclui landmarks, foco visível, labels, link de salto e modais com controle de foco. Não foi medida uma pontuação Lighthouse nem feita auditoria visual em navegador nesta execução; a meta de desempenho deve ser reavaliada após inserir os materiais reais.

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

Botões têm alvo confortável; o celular reorganiza as composições, exibe menu integral e mantém os controles acessíveis. Os ícones vêm de Lucide. O monograma do favicon é provisório, não um logo oficial.
