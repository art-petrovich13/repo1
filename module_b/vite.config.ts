import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Запросы /api и /uploads проксируются на Laravel (module_a), поэтому
// клиент работает с относительными адресами и не зависит от CORS/хоста.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || 'http://127.0.0.1:8000'
  const proxy = {
    '/api': { target, changeOrigin: true },
    '/uploads': { target, changeOrigin: true },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173, proxy },
    preview: { port: 5173, proxy },
    build: { chunkSizeWarningLimit: 900 },
  }
})
