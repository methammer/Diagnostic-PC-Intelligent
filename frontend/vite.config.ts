import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Votre serveur backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // Assurez-vous que /api est conservé si votre backend l'attend
      }
    }
  }
})
