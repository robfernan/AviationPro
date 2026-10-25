import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react'],
  },
  server: {
    host: true,
    proxy: {
      '/aviationweather': {
        target: 'https://aviationweather.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/aviationweather/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  base: './',
});
