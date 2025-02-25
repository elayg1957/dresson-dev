import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/dresson-dev/", // Ensure this matches your repo name on GitHub Pages
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2600, // Optional: Suppress chunk size warnings
  },
})
