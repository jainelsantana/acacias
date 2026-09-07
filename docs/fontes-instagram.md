# Materiais oficiais — 5 de setembro de 2026

## Origem das fotografias

Perfil indicado pelo usuário: [@oficialacacias](https://www.instagram.com/oficialacacias/).

O usuário determinou que as capturas enviadas no chat não fossem usadas no site. Os quatro arquivos derivados dessas capturas e suas referências foram removidos. Não devem ser reintroduzidos como imagens, recortes ou versões ampliadas.

As duas fotografias abaixo foram baixadas diretamente dos arquivos de imagem servidos pelo Instagram, por meio do navegador, a partir de publicações públicas. Não são capturas de tela. As dimensões são as dos arquivos recuperados; não representam uma afirmação sobre a resolução dos arquivos de câmera.

| Publicação oficial                                                                       | Data                   | Arquivo recuperado | Conteúdo e resumo factual da legenda                                                                   | Crédito                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------- | ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Aivlis no palco](https://www.instagram.com/oficialacacias/p/DSGa1KhjRKw/)               | 10 de dezembro de 2025 | 1440 × 1919 px     | Fotografia de Aivlis cantando. A publicação celebra seu aniversário e a apresenta como a voz da banda. | Fotógrafo não identificado na legenda consultada; manter autoria a confirmar.                                                                                                                                                                       |
| [Portátil no Palácio da Música](https://www.instagram.com/oficialacacias/p/C_GZTRvPy0K/) | 25 de agosto de 2024   | 1440 × 960 px      | Banda junto ao público no Palácio da Música. A legenda registra o show de Portátil.                    | Fotografia: [@marisa.oliveiraa](https://www.instagram.com/marisa.oliveiraa/). A publicação também credita produção a [@acaciasproducoes](https://www.instagram.com/acaciasproducoes/) e styling a [@sarasemh](https://www.instagram.com/sarasemh/). |

Essas imagens são diferentes dos ensaios no pátio e junto ao carro azul vistos nas referências do usuário. Os arquivos originais desses ensaios continuam pendentes: o carregamento das publicações antigas no navegador exige login. As legendas desses ensaios não foram lidas e seus créditos não foram confirmados.

## Informações confirmadas no perfil

A [bio oficial](https://www.instagram.com/oficialacacias/), consultada no navegador, informa Teresina e atividade desde 2016. Ela associa Aivlis à voz, João Brandim à guitarra e Cássio Carvalho ao teclado. Essa leitura não confirma, por si só, uma lista completa da formação atual nem a função de integrantes não citados na bio.

Em 6 de setembro de 2026, o usuário forneceu novos retratos oficiais de Aivlis Amorim, João Brandim e Cássio Carvalho e informou que Amadeu Alencar não faz mais parte da banda. A formação exibida no site foi atualizada para esses três integrantes. A autoria fotográfica dos retratos não foi informada e permanece a confirmar.

## Links oficiais de música

O perfil aponta para o [Linktree da banda](https://linktr.ee/bandacacias). A página foi lida diretamente e publica os seguintes destinos:

- Portátil: [Spotify](https://open.spotify.com/album/69KMbMubsnLZG8IFBUDqmc), [Deezer](https://deezer.page.link/CkLz3sUwCes1Wzc26), [YouTube Music](https://music.youtube.com/playlist?list=OLAK5uy_kvqmuuf-BwRDQ9nwjY8J_vgMmqMHCUYMc), [Amazon Music](https://music.amazon.com/albums/B0D8MHHDMZ), [Apple Music](https://music.apple.com/br/album/port%C3%A1til-ep/1755242472) e [Tidal](https://tidal.com/browse/album/372781535).
- [Videoclipe Pertencer](https://youtu.be/UfwHebZTH9k).
- [Canal oficial no YouTube](https://www.youtube.com/@acaciasbanda).

O registro da consulta está em `artifacts/research/linktree-official-evidence.json`. As miniaturas do Linktree não foram tratadas como substitutas das fotografias solicitadas.

### Esconderijo — links conferidos em 6 de setembro de 2026

Os destinos do EP foram conferidos nos catálogos das plataformas, separadamente dos perfis da banda:

- [Spotify](https://open.spotify.com/album/61l8RWLI8X3fDzmMneFveC): identificado no player da matéria da Geleia Total e confirmado pelos metadados públicos do Spotify.
- [Apple Music](https://music.apple.com/br/album/esconderijo-ep/1694027525): álbum vinculado ao perfil oficial de Acácias (`1622753995`).
- [Deezer](https://www.deezer.com/album/456874365): a API pública identifica Acácias (`12554286`), cinco faixas e lançamento em 12 de julho de 2023.
- [YouTube Music](https://music.youtube.com/playlist?list=OLAK5uy_kKLv_1DUD1qejM5CORxhTAZ_x1GTG4MUo): playlist do álbum Esconderijo, exibida pelo catálogo musical do YouTube com as faixas distribuídas pela ONErpm no canal Acácias - Topic. A [mesma playlist no YouTube](https://www.youtube.com/playlist?list=OLAK5uy_kKLv_1DUD1qejM5CORxhTAZ_x1GTG4MUo) permite conferir o álbum completo.

Esses destinos ficam em `esconderijoLinks`, em `lib/instagram-content.ts`, e são consumidos pelo lançamento no conteúdo inicial. As URLs também foram aplicadas ao conteúdo salvo no Studio local, preservando os demais campos.

### Só Por Você — links oficiais

- [Spotify](https://open.spotify.com/album/5MmsajdKxBebnYFErK7lOE): single relacionado no catálogo de Acácias, com título confirmado pelos metadados públicos do Spotify.
- [Apple Music](https://music.apple.com/br/album/s%C3%B3-por-voc%C3%AA/1755242472?i=1755242474): endereço direto da faixa Só por Você em Portátil. O catálogo público da Apple confirma o artista Acácias (`1622753995`) e a faixa (`1755242474`); a consulta pelo UPC do single não retornou uma edição separada.
- [YouTube](https://www.youtube.com/watch?v=yz3lUouKwXE): vídeo “Só Por Você - Acácias”, publicado no canal oficial [@acaciasbanda](https://www.youtube.com/@acaciasbanda), com título e autoria confirmados pelo oEmbed do YouTube.
- [Deezer](https://www.deezer.com/album/593590922): single de Acácias (`12554286`), com uma faixa e UPC `705221336883`, confirmado pela API pública.

Os quatro destinos ficam em `soPorVoceLinks`, em `lib/instagram-content.ts`, e são usados no destaque, no cartão e nos detalhes do lançamento. Também foram aplicados ao conteúdo salvo no Studio local, preservando os demais campos.

## Limites da pesquisa

As tentativas de leitura do Instagram por busca e HTTP retornaram páginas de erro ou exigência de autenticação. O navegador permitiu consultar o perfil e as duas publicações documentadas acima. Nenhuma legenda de matéria jornalística foi apresentada como legenda do Instagram, e nenhum crédito foi deduzido por semelhança visual.

Contatos, press kit, demais fotografias e informações ausentes continuam dependentes de fonte oficial. Os textos poéticos do site são propostas editoriais, não transcrições de declarações da banda.
