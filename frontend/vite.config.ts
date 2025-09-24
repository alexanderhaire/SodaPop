import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'motion-utils-window-config',
      resolveId(source, importer) {
        if (
          source === './window-config.mjs' &&
          importer?.includes('motion-utils/dist/es/index.mjs')
        ) {
          return path.resolve(
            __dirname,
            'node_modules/motion-utils/dist/es/global-config.mjs'
          );
        }
        return null;
      },
    },
    {
      name: 'resolve-process-browser',
      resolveId(source) {
        if (source === 'process/browser/' || source === 'process/browser') {
          return path.resolve(__dirname, 'node_modules/process/browser.js');
        }
        return null;
      },
    },
  ],
  base: '/',
  server: {
    open: false,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    manifest: true,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      'process/browser': 'process/browser.js',
      'process/browser/': 'process/browser.js',
      'motion-utils/dist/es/window-config.mjs': 'motion-utils/dist/es/global-config.mjs',
    },
  },
  define: {
    'process.env': {},
    global: 'window',
  },
  optimizeDeps: {
    include: [
      '@solana/web3.js',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-phantom',
      '@solana/spl-token',
      'buffer',
    ],
  },
});
