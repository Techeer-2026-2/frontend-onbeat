import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        // 배포된 백엔드로 붙이려면: API_PROXY_TARGET=https://<음악앱 도메인> npm run dev
        target: process.env.API_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        // 프록시는 같은 출처 요청이므로 브라우저 Origin(localhost)을 빼서 백엔드 CORS 거절(403)을 피한다
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
})
