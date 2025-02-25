import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { chunkSplitPlugin } from 'vite-plugin-chunk-split' //  Use named import

export default defineConfig({
  plugins: [
    react(),
    chunkSplitPlugin({
      strategy: 'all-in-one', //  Automatically splits large chunks
    }),
  ],
  build: {
    chunkSizeWarningLimit: 2100, //  Suppresses warning for large files
  },
})
