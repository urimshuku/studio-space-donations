/**
 * Reads VITE_PAYPAL_CLIENT_ID from process.env (CI) or .env file (local).
 * Used by vite.config to inject the value reliably.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

function fromProcessEnv() {
  const v = process.env.VITE_PAYPAL_CLIENT_ID;
  if (v != null && String(v).trim()) return String(v).trim();
  return '';
}

function fromEnvFile() {
  try {
    const cwdEnv = path.join(process.cwd(), '.env');
    const paths = [envPath, cwdEnv];
    for (const p of paths) {
      if (!fs.existsSync(p)) continue;
      const content = fs.readFileSync(p, 'utf-8');
      const line = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => l.startsWith('VITE_PAYPAL_CLIENT_ID='));
      if (!line) continue;
      const value = line.slice('VITE_PAYPAL_CLIENT_ID='.length).trim();
      const cleaned = value.replace(/^["']|["']$/g, '').trim();
      if (cleaned) return cleaned;
    }
  } catch {
    /* ignore */
  }
  return '';
}

export function getPaypalClientId() {
  return fromProcessEnv() || fromEnvFile();
}
