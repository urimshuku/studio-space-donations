import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getPaypalClientId } from './scripts/loadPaypalEnv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Injects PayPal client ID into index.html so the app can read it at runtime if import.meta.env fails. */
function paypalEnvHtmlPlugin() {
  const paypalClientId = getPaypalClientId();
  const snippet = `window.__PAYPAL_CLIENT_ID__=${JSON.stringify(paypalClientId)};`;
  return {
    name: 'paypal-env-html',
    transformIndexHtml(html: string) {
      return html.replace(
        '</head>',
        `<script>${snippet}</script>\n  </head>`
      );
    },
  };
}

// https://vitejs.dev/config/
// BASE_PATH is set by GitHub Actions for Pages (e.g. /repo-name/). Leave unset for local dev.
export default defineConfig(({ mode }) => {
  const paypalClientId = getPaypalClientId();
  if (mode === 'development' && !paypalClientId) {
    console.warn('[vite] VITE_PAYPAL_CLIENT_ID not found in .env. Add it to .env in the project root and restart.');
  }
  return {
    base: process.env.BASE_PATH || '/',
    envDir: __dirname,
    plugins: [react(), paypalEnvHtmlPlugin()],
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
