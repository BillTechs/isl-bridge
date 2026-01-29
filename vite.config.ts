
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path for GitHub Pages compatibility
  base: './',
  define: {
    // This allows the build process to replace process.env.API_KEY with the actual key
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensure the build process handles the environment variable correctly
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
});
