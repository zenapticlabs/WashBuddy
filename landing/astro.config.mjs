
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@splidejs/react-splide"]
    },
    ssr: {
      noExternal: ["@splidejs/react-splide"]
    }
  },

  integrations: [react()]
});