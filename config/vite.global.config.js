import { resolve } from 'node:path'
import nodeExternalsPlugin from './plugins/node-externals.js'
import nodeShimsForEsmPlugin from './plugins/node-shims-for-esm.js'

import multipageConfig from './vite.multipage.config.js'

const pluginList = [
  {
    name: 'node-externals',
    plugin: nodeExternalsPlugin
  },
  {
    name: 'node-shims-for-esm',
    plugin: nodeShimsForEsmPlugin
  }
]

export default function useGlobalConfig({
  configType = 'common',
  pkgName = 'pino-cli',
  plugins = []
} = {}) {
  let config = {
    resolve: {
      alias: {
        config: resolve(__dirname, '../config'),
        packages: resolve(__dirname, '../packages'),
				'@': resolve(__dirname, './src')
      },
      extensions: [
        '.mjs',
        '.cjs',
        '.js',
        '.mts',
        '.ts',
        '.jsx',
        '.tsx',
        '.json'
      ]
    }
  }
  switch (configType) {
    case 'common':
      break
    case 'lib':
      config = {
        ...config,
        // https://cn.vite.dev/config/build-options#build-lib
        build: {
          lib: {
            entry: resolve(__dirname, `../packages/${pkgName}/main.js`),
            name: pkgName,
            fileName: pkgName
          },
          rollupOptions: {
            external: [],
            output: {
              globals: {}
            }
          }
        }
      }
      break
		case 'multipage':
			config = {
        ...config,
        ...multipageConfig
      }
			break
    default:
      config = {}
      break
  }
  if (plugins.length) {
    const transformPlugins = plugins.map(pluginName => {
      return pluginList.find(plugin => plugin.name === pluginName).plugin()
    })
    config.build.rollupOptions.plugins = transformPlugins
  }
  return config
}
