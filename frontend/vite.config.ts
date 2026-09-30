<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8008',
>>>>>>> 06d7a50b1e9874e1f3c047ce23b8ed89374ee878
        changeOrigin: true,
      },
    },
  },
<<<<<<< HEAD
})
=======
});
>>>>>>> 06d7a50b1e9874e1f3c047ce23b8ed89374ee878
