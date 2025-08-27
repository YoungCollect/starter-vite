import path from 'node:path'

// 该文件放置微小配置 谨慎设置分包等功能 因为lib功能也依赖了该文件
export default () => {
	return {
		resolve: {
			alias: {
				config: path.resolve(__dirname, '../../config'),
				packages: path.resolve(__dirname, '../../packages'),
				'@': path.resolve(__dirname, '../../src')
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
}
