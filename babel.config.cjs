module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // 采用 EsModule
        modules: false,
        targets: ['> 1%', 'last 2 versions', 'not ie <= 8']
      }
    ]
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        // useBuiltIns属性已被默认设置
        // 推荐corejs设置3，因为这个版本支持实例属性
        corejs: 3
      }
    ]
  ]
}
