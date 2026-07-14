import { defineConfig } from 'vite'
import { resolve } from 'path'

// NOTE: To test Stripe checkout locally, use `vercel dev` instead of `npm run dev`.
// `vercel dev` runs both the Vite frontend AND the /api serverless functions together.
// Install Vercel CLI once: npm i -g vercel

export default defineConfig({
  server: {
    host: '0.0.0.0',   // Escucha en TODAS las interfaces de red (WiFi incluida)
    port: 3001,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        store:   resolve(__dirname, 'store.html'),

        admin:   resolve(__dirname, 'admin.html'),
        success: resolve(__dirname, 'success.html'),
        cancel:  resolve(__dirname, 'cancel.html'),
        terms:   resolve(__dirname, 'terms.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        shippingReturns: resolve(__dirname, 'shipping-returns.html'),
      },
    },
  },
})
