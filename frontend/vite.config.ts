import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Everything under /api goes to the BFF, which is the only backend the browser knows about.
// nginx does the same job in docker.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4100',
        changeOrigin: true,
      },
    },
  },
});
