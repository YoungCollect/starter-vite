import { defineConfig, mergeConfig } from 'vite'
import useGlobalConfig from '../../config/vite.global.config.js'
import { resolve } from 'node:path'
import resolveAlias from './resolve-alias.js'

export default defineConfig(
  mergeConfig(
    useGlobalConfig({
      configType: 'lib',
      pkgName: 'pino-shared',
      plugins: ['node-externals', 'node-shims-for-esm']
    }),
    {
      resolve: {
        alias: resolveAlias.alias
      },
      build: {
        lib: {
          entry: {
            'pino-shared': resolve(__dirname, 'main.cjs')
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
        }
      }
    }
  )
)
