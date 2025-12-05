import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // React plugin
  base: './', // Important for Electron to load assets correctly in production
  server: {
    port: 5173,
    strictPort: true,
  }
})
