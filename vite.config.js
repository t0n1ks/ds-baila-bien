import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base must match the GitHub Pages repo path. On Vercel this becomes '/'.
export default defineConfig({
  plugins: [react()],
  base: '/ds-baila-bien/',
});
