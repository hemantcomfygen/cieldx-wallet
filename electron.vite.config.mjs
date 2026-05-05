import { resolve } from 'path'  // ← Add this line
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    base: './',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react(),
      tailwindcss(),
      nodePolyfills({
        protocolImports: true,
        globals: {
          Buffer: true,
          process: true,
          global: true,
        },
      }),
      wasm(),
    ],
    define: {
      global: "globalThis",
    },

    optimizeDeps: {
      include: ["buffer", "process"],
    },
    publicDir: resolve(__dirname, 'public')
  }
})
