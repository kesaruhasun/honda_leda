import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import { createApiHandler } from '../tests/e2e/mock_server.mjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pulseos-api',
      configureServer(server) {
        const { handler } = createApiHandler();
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          if (url.startsWith('/api/') || url === '/health' || url.startsWith('/health')) {
            return handler(req, res);
          }
          next();
        });
      },
      configurePreviewServer(server) {
        const { handler } = createApiHandler();
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          if (url.startsWith('/api/') || url === '/health' || url.startsWith('/health')) {
            return handler(req, res);
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
