import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'game-[hash].js',
        format: 'iife',
        name: 'CultivationSimulator',
        // Don't inline the IIFE - we need window exposure
        inlineDynamicImports: false,
      },
    },
    minify: false,
    sourcemap: false,
    // Treat game.js as a classic script, not a module
    commonjsOptions: {
      ignoreDynamicRequires: true,
    },
  },
  // Vite's esbuild would normally minify, but we disabled minify
  esbuild: {
    minify: false,
    sourcemap: false,
  },
});
