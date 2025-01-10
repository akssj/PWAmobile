import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: true,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'PWA Mobile Kantor',
      short_name: 'PWAMobile',
      description: 'My PWA app',
      theme_color: '#ffffff',
      icons: [
        {
          src: '/icons/pwa-icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/pwa-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})