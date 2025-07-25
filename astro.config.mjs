import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    format: 'file'
  },
  server: {
    port: 5000,
    host: '0.0.0.0'
  },
  vite: {
    server: {
      port: 5000,
      host: '0.0.0.0'
    }
  }
});
