import { defineConfig, mergeConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import useViteConfig from './config/useViteConfig'

export default defineConfig(
  mergeConfig(useViteConfig({ configType: 'singlepage' }), {
    plugins: [vue()]
  })
)
