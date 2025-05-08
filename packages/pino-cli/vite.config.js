import { defineConfig, mergeConfig } from 'vite'
import useGlobalConfig from '../../config/vite.global.config.js'
import { resolve } from 'node:path'
import fs from 'node:fs'
import resolveAlias from './scripts/resolve-alias.js'

const constantsEntries = fs
  .readdirSync(resolve(__dirname, 'src/constants'))
  .map(file => {
    const entryName = file.split('.')[0]
    return {
      [`constants/${entryName}`]: resolve(__dirname, `src/constants/${file}`)
    }
  })
  .reduce((pre, cur) => {
    return {
      ...pre,
      ...cur
    }
  }, {})

export default defineConfig(
  mergeConfig(
    useGlobalConfig({
      configType: 'lib',
      pkgName: 'pino-cli',
      plugins: ['node-externals', 'node-shims-for-esm']
    }),
    {
      resolve: {
        alias: resolveAlias.alias
      },
      build: {
        lib: {
          entry: {
            'pino-cli': resolve(__dirname, 'main.cjs'),
            ...constantsEntries
          },
          fileName: (format, entryName) =>
            format === 'es' ? `${entryName}.js` : `${entryName}.cjs`,
          formats: ['es', 'cjs']
        },
        rollupOptions: {
          output: {
            globals: {}
          },
          plugins: []
        },
        commonjsOptions: {
          // 忽略require(variable)的动态导入
          ignoreDynamicRequires: true
        }
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }
  )
)
