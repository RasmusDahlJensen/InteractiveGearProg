import react from '@vitejs/plugin-react';
import path from 'path';
import process from 'node:process';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];

// https://vite.dev/config/
export default defineConfig({
  base: repositoryName ? `/${repositoryName}/` : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(__dirname, '../data')
    }
  },
  server: {
    port: 5173
  }
})
