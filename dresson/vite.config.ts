import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/dresson-dev/", //  Set this to match your GitHub Pages repo
  plugins: [react()],
})
