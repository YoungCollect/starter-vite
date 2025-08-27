import path from 'node:path'
import nodeExternalsPlugin from '../plugins/node-externals.js'
import nodeShimsForEsmPlugin from '../plugins/node-shims-for-esm.js'

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

export default ({ pkgName, plugins = [] }) => {
	return {
		// https://cn.vite.dev/config/build-options#build-lib
		build: {
			lib: {
				entry: path.resolve(__dirname, `../../packages/${pkgName}/main.js`),
				name: pkgName,
				fileName: pkgName
			},
			rollupOptions: {
				external: [],
				output: {
					globals: {}
				},
				plugins: plugins.map(pluginName => {
					return pluginList.find(plugin => plugin.name === pluginName).plugin()
				})
			}
		}
	}
}
