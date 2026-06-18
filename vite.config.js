import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    proxy: {
      // 系统服务（认证、用户、管理）
      '/api/auth': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/login': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/info': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/users': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/roles': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/user-roles': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/user/addresses': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      // 用户端：商品服务 (8202)
      '/user/products': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      '/user/reviews': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      '/user/cart': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      '/user/orders': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      '/user/payments': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      // 管理端：商品服务 (8201)
      '/admin/products': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/categories': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/reviews': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/orders': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/payments': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/file': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/coupons': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/admin/after-sales': {
        target: 'http://localhost:8201',
        changeOrigin: true
      },
      '/user/coupons': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      '/user/after-sales': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      '/user/my-coupons': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      // 支付宝支付
      '/api/pay': {
        target: 'http://localhost:8202',
        changeOrigin: true
      },
      // AI 智能助手服务 (8203)
      '/api/ai': {
        target: 'http://localhost:8203',
        changeOrigin: true
      }
    }
  }
})
