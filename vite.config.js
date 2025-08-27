import { defineConfig, mergeConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import useGlobalConfig from './config/vite.global.config'

export default defineConfig(
  mergeConfig(useGlobalConfig({ configType: 'multipage' }), {
    plugins: [vue()]
  })
)
