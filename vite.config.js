import { defineConfig, mergeConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import useViteConfig from './config/useViteConfig'

export default async () => defineConfig(
	mergeConfig(await useViteConfig({ configType: 'multipage' }), {
		plugins: [vue()]
	})
)
