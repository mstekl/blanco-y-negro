import { defineConfig } from 'vite';

export default defineConfig({
  // Our game lives in src/main.js
  base: './',
  build: {
    outDir: 'dist'
  }
});
