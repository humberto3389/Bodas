import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animations';
            }
            if (id.includes('swiper')) {
              return 'vendor-gallery';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Other node_modules
            return 'vendor-other';
          }
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/styles.[hash].css';
          }
          return 'assets/[name].[hash][extname]';
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: false // Mejora velocidad de build
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'swiper', '@supabase/supabase-js'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  resolve: {
    dedupe: ['@supabase/supabase-js']
  },
  server: {
    port: 5174,
    host: '0.0.0.0', // Permite acceso desde otros dispositivos/navegadores
    strictPort: false, // Permite usar otro puerto si 5174 está ocupado
    hmr: {
      clientPort: 5174 // Puerto del cliente para HMR
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate' // Desactiva caché en desarrollo
    }
  }
})
