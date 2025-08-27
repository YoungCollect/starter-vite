import path from 'node:path'
import fs from 'node:fs'
import { mergeConfig } from 'vite'
import minimist from 'minimist'
import { getEntryPage } from '../utils/index.js'
// import { pxtovw } from '../plugins/pxtovw'

const pagesContext = path.resolve(__dirname, '../../src/pages')
const pagesOutput = path.resolve(__dirname, '../../dist')

const index = process.argv.indexOf('--')
const args = minimist(process.argv.slice(index + 1))

const pageName = (typeof(args.page) === 'string' || typeof(args.page) === 'number') ? args.page : ''

export default async () => {
	const { input, subViteConfig } = await getEntryPage(pagesContext, pageName)
	return mergeConfig({
		root: path.resolve(__dirname, `${pagesContext}/${pageName}`),
		base: '/',
		envDir: process.cwd(),
		build: {
			outDir: path.resolve(__dirname, `${pagesOutput}/${pageName}`),
			assetsInlineLimit: 4096, //小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求
			emptyOutDir: true, // 在构建时清空目录
			rollupOptions: {
				input,
				output: {
					assetFileNames: '[ext]/[name]-[hash].[ext]',
					chunkFileNames: 'js/[name]-[hash].js',
					entryFileNames: 'js/[name]-[hash].js',
					compact: true,
					manualChunks: (id) => {
						if (id.includes('node_modules')) {
							return id.toString().split('node_modules/')[1].split('/')[0].toString()
						}
					}
				}
			},
			target: 'modules'
		},
		css:{
			postcss:{
				// plugins:[pxtovw]
			}
		},
	}, subViteConfig)
}
