module.exports = {
  // process.env.NODE_ENV 默认是 false
  __DEV__: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
}
