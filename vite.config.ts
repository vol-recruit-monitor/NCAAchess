import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative base so the built site works both at the domain root and under a
  // GitHub Pages project subpath (e.g. https://user.github.io/repo/). All
  // runtime asset loads use import.meta.env.BASE_URL to match.
  base: './',
  plugins: [react(), tailwindcss()],
});
