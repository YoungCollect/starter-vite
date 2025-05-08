import nodeExternals from 'rollup-plugin-node-externals'
/*
  将node的相关依赖external化，譬如node:path node:url node:fs等
  这样，无论是esm还是cjs，都会保留正常的import或者require语句，而不会打包node相关的依赖

	另外，该插件也会[默认排除package.json中的dependencies](https://www.npmjs.com/package/rollup-plugin-node-externals)
*/
export default function nodeExternalsPlugin() {
  return nodeExternals()
}
