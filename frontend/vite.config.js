import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const keyPath = path.resolve(__dirname, 'certs/localhost+2-key.pem')
const certPath = path.resolve(__dirname, 'certs/localhost+2.pem')

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    host: 'localhost',
    port: 8443,
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
