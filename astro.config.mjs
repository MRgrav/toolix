// @ts-check
import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['toolix.deolang.com', '.deolang.com', 'localhost'],
      headers: {
        // Security headers for FFmpeg WASM and SharedArrayBuffer performance
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    },
    preview: {
      allowedHosts: ['toolix.deolang.com', '.deolang.com', 'localhost'],
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    },
  },
});



