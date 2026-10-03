import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Savethekitten/',
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  test: {
    environment: 'node',
    globals: true
  }
});
