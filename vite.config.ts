import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
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
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['jspdf', 'html2canvas', 'dompurify'],
        },
      },
    },
  },
});
