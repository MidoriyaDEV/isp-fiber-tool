import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    proxy: {
      '/api': {
        target: 'http://45.225.251.14:5003',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true, // <<< habilita os source maps
    rollupOptions: {
      input: './index.html'
    }
  }
})
