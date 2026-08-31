import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Both APIs are proxied so the browser only ever talks to one origin, which keeps CORS
// out of the picture in development. In docker, nginx does the same job.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/catalog': {
        target: 'http://localhost:5080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/catalog/, '/api'),
      },
      '/api/orders': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
