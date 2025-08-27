import { resolve } from 'node:path'
import fs from 'node:fs'
import minimist from 'minimist'
import { getEntryPage } from './utils/index.js'
// import { pxtovw } from './plugins/pxtovw'

const pagesContext = resolve(__dirname, '../src/pages')
const pagesOutput = resolve(__dirname, '../dist')

const index = process.argv.indexOf('--')
const args = minimist(process.argv.slice(index + 1))

const pageName = (typeof(args.page) === 'string' || typeof(args.page) === 'number') ? args.page : ''

export default {
  root: resolve(__dirname, `${pagesContext}/${pageName}`),
  base: '/',
	envDir: process.cwd(),
  build: {
    outDir: resolve(__dirname, `${pagesOutput}/${pageName}`),
    assetsInlineLimit: 4096, //小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求
    emptyOutDir: true, // 在构建时清空目录
    rollupOptions: {
      input: {
        ...getEntryPage(pagesContext, pageName)
      },
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
}
