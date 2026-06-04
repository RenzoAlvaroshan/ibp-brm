import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
      // Dataverse proxies — let the dev server make the cross-origin calls so
      // the browser is not blocked by CORS. See src/dataverse/client.ts.
      '/dv-token': {
        target: 'https://login.microsoftonline.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/dv-token/, ''),
      },
      '/dv-api': {
        target: process.env.VITE_DATAVERSE_RESOURCE_URL || 'https://example.api.crm5.dynamics.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/dv-api/, ''),
      },
    },
  },
})
