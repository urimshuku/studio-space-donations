import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// BASE_PATH is set by GitHub Actions for Pages (e.g. /repo-name/). Leave unset for local dev.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: {
    host: true, // listen on 0.0.0.0 so you can open http://<your-ip>:5175 on your phone
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
