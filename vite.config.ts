import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: { port: 5173 },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
  build: {
    rollupOptions: {
      external: ['@supabase/supabase-js'],
    },
  },
  ssr: {
    noExternal: ['@supabase/supabase-js'],
  },
})
