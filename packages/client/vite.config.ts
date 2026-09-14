import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    // React with Fast Refresh — SWC-based transform for faster HMR
    react(),

    // Gzip pre-compressed assets for production serving
    compression({ algorithm: 'gzip', exclude: [/\.(png|jpe?g|gif|webp|svg|ico)$/] }),

    // Brotli (better compression ratio where supported)
    compression({ algorithm: 'brotliCompress', exclude: [/\.(png|jpe?g|gif|webp|svg|ico)$/] }),
  ],

  // ─── Dev Server ───────────────────────────────────────────────────────────
  server: {
    port: 6969,
    strictPort: true,
    host: true,
    // Warm up most visited routes so they're pre-transformed on first load
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/main.tsx',
        './src/pages/auth/Login.tsx',
        './src/pages/dashboard/Dashboard.tsx',
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:6970',
        changeOrigin: true,
        // Preserve headers for auth
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('[proxy error]', err));
        },
      },
      '/uploads': { target: 'http://localhost:6970', changeOrigin: true },
    },
  },

  // ─── Build Optimizations ──────────────────────────────────────────────────
  build: {
    // Modern browsers target — smaller output, no IE11 polyfills
    target: 'esnext',

    // Report bundle size — warn at 500KB, error at 1000KB
    chunkSizeWarningLimit: 500,

    // Use esbuild for minification (faster than terser)
    minify: 'esbuild',

    // Inline small assets as base64 (saves HTTP requests)
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        // ─── Manual chunk splitting ────────────────────────────────────────
        // Splits vendor code by domain so each chunk can be cached independently.
        // Heavy 3D, Firebase, and Charts are isolated from the main bundle.
        manualChunks(id) {
          // Heavy 3D layer — only loaded by ProjectReportPage
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          // Firebase — only loaded when needed for auth
          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }
          // Recharts — only loaded by admin/analytics pages
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
            return 'vendor-charts';
          }
        },

        // Stable hashing — only changed chunks get new hashes
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },

  // ─── Dependency Pre-bundling ──────────────────────────────────────────────
  // Forces Vite to pre-bundle these on startup — eliminates per-import waterfalls in dev
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react',
      'react-hot-toast',
      'react-hook-form',
      'zod',
      '@hookform/resolvers/zod',
    ],
  },

  // ─── CSS Optimization ─────────────────────────────────────────────────────
  css: {
    devSourcemap: false, // Faster CSS in dev (no sourcemaps)
  },
});
