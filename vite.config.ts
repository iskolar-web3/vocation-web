import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
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

  if (command === 'build' && mode === 'production') {
    if (!apiUrl) {
      throw new Error('Build failed: VITE_API_URL environment variable is required in production.');
    }
    const httpsError = new Error(
      `Build failed: VITE_API_URL must be an https URL in production (got ${apiUrl}).`,
    );
    let parsed: URL;
    try {
      parsed = new URL(apiUrl);
    } catch {
      throw httpsError;
    }
    const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (parsed.protocol !== 'https:' && !isLocal) {
      throw httpsError;
    }
  }

  return {
    plugins: [
      TanStackRouterVite({
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        autoCodeSplitting: true,
      }),
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
