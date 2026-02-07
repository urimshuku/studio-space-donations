import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// BASE_PATH is set by GitHub Actions for Pages (e.g. /repo-name/). Leave unset for local dev.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
