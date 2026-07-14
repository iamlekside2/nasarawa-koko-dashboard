import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3013, host: true }, // 3010 NEAS, 3006 koko, 3012 hrrp — this one on 3013
})
