import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // In development, proxy to local backend
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  // In production (Netlify/Vercel), /api/* is redirected to Render backend via netlify.toml
})
