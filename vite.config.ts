import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const equipoRewritePlugin = (): Plugin => ({
  name: 'equipo-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/equipo' || req.url?.startsWith('/equipo?')) {
        req.url = '/equipo.html'
      }
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/equipo' || req.url?.startsWith('/equipo?')) {
        req.url = '/equipo.html'
      }
      next()
    })
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), equipoRewritePlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        equipo: resolve(__dirname, 'equipo.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 8081,
    strictPort: true,
    allowedHosts: ['.trycloudflare.com'],
  },
})