import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
// BASE_PATH is set by GitHub Actions for Pages (e.g. /repo-name/). Leave unset for local dev.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  envDir: __dirname,
  plugins: [react()],
  server: {
    host: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
