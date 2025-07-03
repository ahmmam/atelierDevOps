import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/vote': 'http://localhost:8000',
      '/scores': 'http://localhost:8000'
    }
  }
});

