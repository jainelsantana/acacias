import { build } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

await build({ configFile: 'vite.pages.config.ts' });
await build({
  configFile: 'vite.pages.config.ts',
  publicDir: false,
  build: {
    ssr: resolve('demo/render.tsx'), outDir: resolve('outputs/pages-render'),
    emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'render.mjs' } },
  },
});
const { render } = await import(pathToFileURL(resolve('outputs/pages-render/render.mjs')).href);
const htmlPath = 'outputs/github-pages/index.html';
const template = await readFile(htmlPath, 'utf8');
if (!template.includes('<!--acacias-prerender-->')) throw new Error('Prerender placeholder missing.');
await writeFile(htmlPath, template.replace('<!--acacias-prerender-->', () => render()));
await writeFile('outputs/github-pages/.nojekyll', '');
console.log('Demonstração estática pronta em outputs/github-pages.');
