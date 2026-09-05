import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root: root + 'demo',
  base: '/acacias/',
  publicDir: root + 'public',
  resolve: { alias: { '@': root } },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  build: { outDir: root + 'outputs/github-pages', emptyOutDir: true },
});
