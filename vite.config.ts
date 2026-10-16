import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

function backendServerPlugin() {
  return {
    name: 'backend-server-plugin',
    configureServer() {
      // Automatically launch local persistent backend on port 8080
      import('./scripts/server.mjs').catch((err) => {
        console.error('[Backend Plugin] Error starting server.mjs on port 8080:', err);
      });
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL;

  if (command === 'build' && mode === 'production' && !apiUrl) {
    throw new Error('Build failed: VITE_API_URL environment variable is required in production.');
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      backendServerPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: false,
      watch: {
        ignored: ['**/data/**', '**/*.json', '**/scripts/**'],
      },
    },
  };
});
