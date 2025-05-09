import { resolve } from 'node:path'
import { defineConfig, mergeConfig } from 'vite'
import useGlobalConfig from '../../config/vite.global.config.js'
import { resolveEntries } from '../../config/helper/resolve-entries'
import resolvedAlias from './scripts/resolve-alias'

export default defineConfig(
  mergeConfig(
    useGlobalConfig({
      configType: 'lib',
      pkgName: 'foo',
      plugins: ['node-externals', 'node-shims-for-esm']
    }),
    {
      resolve: {
        alias: resolvedAlias
      },
      build: {
        lib: {
          entry: {
            foo: resolve(__dirname, 'main.cjs'),
            ...resolveEntries({
              contextPath: __dirname,
              dirPath: 'src/constants',
              prefix: 'constants'
            })
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
