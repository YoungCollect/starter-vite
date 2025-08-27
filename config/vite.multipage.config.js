import { resolve } from 'node:path'
import chalk from 'chalk'
import fs from 'node:fs'
import minimist from 'minimist'
import { getContextPages } from './utils/index.js'
// import { pxtovw } from './config/plugin'

const pagesContext = resolve(__dirname, '../src/pages')
const pagesOutput = resolve(__dirname, '../dist')

// pnpm dev -- --page=client
const args = minimist(process.argv[2] === '--' ? process.argv.slice(3) : process.argv.slice(2))

const pages = getContextPages(pagesContext)

const argsPage = (typeof(args.page) === 'string' || typeof(args.page) === 'number') ? args.page : ''

const log = (str) => console.log(str)

//获取指定的单页面入口
const getEntries = () => {
  if (!argsPage) {
    log(
      chalk.red('Missing page parameter. Usage: pnpm dev -- --page=pageName')
    )
    process.exit(1)
  } else {
    log(chalk.yellow(`Building page: ${argsPage}`))
  }
  const filterArr = pages.filter(
    (item) => item.page.toLowerCase() === argsPage.toLowerCase()
  )
  if (!filterArr.length) {
    log(chalk.red(`Page '${argsPage}' not found. Available pages: ${pages.map(p => p.page).join(', ')}`))
		process.exit(1)
  }
  return {
    [argsPage]: resolve(__dirname, `${pagesContext}/${argsPage}/index.html`)
  }
}

export default {
  root: resolve(__dirname, `${pagesContext}/${argsPage}`),
  base: '/', //公共基础路径
  // envDir: resolve(__dirname), //用于加载 .env 文件的目录
  build: {
    outDir: resolve(__dirname, `${pagesOutput}/${argsPage}`),
    assetsInlineLimit: 4096, //小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求
    emptyOutDir: true, // 在构建时清空目录
    rollupOptions: {
      input: {
        ...getEntries()
      },
      output: {
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        compact: true,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString() // 拆分多个vendors
          }
        }
      }
    },
    // Vite 将替换 modules 为 ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
    target: 'modules'
  },
  css:{
    postcss:{
      // plugins:[pxtovw]
    }
  },
}
