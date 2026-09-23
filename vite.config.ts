import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Reads ALLOWED_HOSTS (comma-separated, or "*" to allow all) for the
// Vite dev server's host check.
function resolveAllowedHosts(): string[] | true {
  const raw = (process.env.ALLOWED_HOSTS || '').trim();
  if (raw === '*' || raw.toLowerCase() === 'true') return true;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Extra public hostnames allowed to reach the Vite dev server,
      // comma-separated (e.g. ALLOWED_HOSTS=my-app.onrender.com).
      // Required when the dev server is exposed on a public hostname;
      // "*" allows all (only on trusted networks). Unset = localhost only.
      allowedHosts: resolveAllowedHosts(),
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  };
});
