import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === 'production' ? `/${process.env.REPO_NAME || 'cheatsheets'}/` : '/',
}))
