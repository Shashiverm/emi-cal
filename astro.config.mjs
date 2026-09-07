// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fincalc.in',
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/.playwright-mcp/**', '**/*.csv']
      }
    }
  },
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});