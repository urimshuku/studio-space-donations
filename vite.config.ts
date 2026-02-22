import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
// BASE_PATH is set by GitHub Actions for Pages (e.g. /repo-name/). Leave unset for local dev.
export default defineConfig(({ mode }) => {
  const envDir = __dirname;
  const env = loadEnv(mode, envDir, '');
  const paypalClientId = (env.VITE_PAYPAL_CLIENT_ID ?? process.env.VITE_PAYPAL_CLIENT_ID ?? '').toString().trim();
  return {
    base: process.env.BASE_PATH || '/',
    envDir,
    plugins: [react()],
    server: {
      host: true, // listen on 0.0.0.0 so you can open http://<your-ip>:5175 on your phone
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      'import.meta.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(paypalClientId),
    },
  };
});
