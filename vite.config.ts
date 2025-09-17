import { defineConfig } from "vite";
import type { Connect, ViteDevServer } from 'vite';
import type http from 'http';
import react from "@vitejs/plugin-react-swc";
import path from "path";
// removed lovable-tagger

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // ensure dev server responses include charset when possible
    {
      name: 'vite-force-charset',
      configureServer(server: ViteDevServer) {
        // middleware runs before Vite serves files; set charset for HTML/JS
        server.middlewares.use((req: http.IncomingMessage & { url?: string }, res: http.ServerResponse, next: Connect.NextFunction) => {
          try {
            const url = req.url || '';
            if (url === '/' || url.endsWith('.html')) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
            } else if (url.endsWith('.js') || url.includes('/src/') || url.includes('/node_modules/')) {
              // serve module scripts with explicit charset
              res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
            }
          } catch (e) {
            // ignore header errors
          }
          next();
        });
      }
    },
  // lovable-tagger removed
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
