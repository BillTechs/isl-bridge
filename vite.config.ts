
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path for GitHub Pages compatibility
  base: './',
  // define header removed as we use VITE_ prefix now
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
