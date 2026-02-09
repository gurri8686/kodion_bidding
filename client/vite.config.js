import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000,
    allowedHosts: ['780705c1e6dd.ngrok-free.app']  // 👈 Add your ngrok domain here
  },
  base: '/'
})
