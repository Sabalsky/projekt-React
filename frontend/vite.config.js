import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api -> backend, dzieki czemu frontend wola tylko REST API (bez CORS w dev).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
