import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";

const manifestForPlugIn = {
  registerType: 'prompt',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'Trupt App',
    short_name: 'Trupt',
    description: 'Trupt Progressive Web App',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    orientation: 'portrait'
  }
};

export default defineConfig({
  plugins: [react(), VitePWA(manifestForPlugIn)],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    allowedHosts: ['trupt-49zt.onrender.com']
  }
})
