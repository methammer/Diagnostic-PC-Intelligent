import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // You can specify the frontend port if needed, default is 5173
    proxy: {
      // Proxy /api requests to your backend server
      '/api': {
        target: 'http://localhost:3001', // Your backend server address
        changeOrigin: true, // Recommended, especially for virtual hosted sites
        secure: false,      // Set to false if your backend is HTTP and not HTTPS
        // No rewrite needed here as your backend routes are also prefixed with /api
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})
