import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      tailwindcss(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
            'vendor-utils': ['axios', 'jwt-decode', 'qrcode.vue', 'lucide-vue-next'],
            'vendor-ui': ['katex', 'marked', 'marked-katex-extension'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
        },
        '/ws': {
          target: env.VITE_WS_PROXY_TARGET,
          ws: true,
        }
      },
      allowedHosts: env.VITE_ALLOWED_HOSTS?.split(',')
    }
  }
})
