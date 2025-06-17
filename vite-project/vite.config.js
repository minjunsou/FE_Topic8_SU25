import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false, // Tắt overlay lỗi HMR để tránh lỗi foregroundCache
    },
    proxy: {
      // Cấu hình proxy cho API để tránh lỗi CORS
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Tắt cache để tránh lỗi với foregroundCache
  optimizeDeps: {
    force: true
  },
})
