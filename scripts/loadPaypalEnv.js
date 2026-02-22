/**
 * Reads VITE_PAYPAL_CLIENT_ID from .env using Node fs (bypasses Vite env).
 * Used by vite.config to inject the value reliably.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

export function getPaypalClientId() {
  try {
    if (!fs.existsSync(envPath)) return '';
    const content = fs.readFileSync(envPath, 'utf-8');
    const line = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.startsWith('VITE_PAYPAL_CLIENT_ID='));
    if (!line) return '';
    const value = line.slice('VITE_PAYPAL_CLIENT_ID='.length).trim();
    return value.replace(/^["']|["']$/g, '').trim();
  } catch {
    return '';
  }
}
