import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // 所有 /api 开头的请求，自动转发到后端 8088 端口
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true
      }
    }
  }
})