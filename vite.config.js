import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    https: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})

