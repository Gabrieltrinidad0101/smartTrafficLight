import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                content: './src/main.jsx',
            },
            output: {
                entryFileNames: 'content.js'
            }
        }
    }
})
