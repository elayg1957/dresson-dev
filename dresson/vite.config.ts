import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import chunkSplitPlugin from 'vite-plugin-chunk-split'

export default defineConfig({
  plugins: [
    react(),
    chunkSplitPlugin({
      strategy: 'all-in-one', // Automatically splits large chunks
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1600, // Suppress warning for large files
  },
})
