import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
    },
    conditions: ['browser'], // 👈 این خط مشکل رو حل می‌کنه
  },
  ssr: {
    noExternal: true, // 👈 و این خط
  },
  server: {
    port: 1420,
    strictPort: true,
  },
});
