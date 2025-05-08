const { pinoSharedTips } = require('@oneyoung/pino-shared')

const configExtends = {
  // transform plugin:vue/essential in '@vue/cli-plugin-eslint' to plugin:vue/recommended
  base: ['plugin:vue/recommended'], // 'plugin:vue/vue3-recommended'
  baseVue3: ['plugin:vue/vue3-recommended'],
  standard: ['@vue/standard'],
  prettier: [
    'eslint:recommended',
    // plugin:prettier/recommended will enable eslint-config-prettier and eslint-plugin-prettier and some rules.
    'plugin:prettier/recommended'
  ]
}

const configRules = {
  base: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off'
  },
  standard: {
    'vue/html-closing-bracket-newline': 'off'
  },
  prettier: {
    // Make function space in vue template, but don't use. Eslint will conflict with Prettier.
    // 'space-before-function-paren': 'error',
    'no-unused-vars': [
      'error',
      {
        // Don't lint unused function params
        args: 'none'
      }
    ],
    // Keep the element closing itself when not contain content.
    'vue/html-self-closing': [
      'error',
      {
        // https://eslint.vuejs.org/rules/html-self-closing.html#vue-html-self-closing
        html: {
          void: 'any'
        }
      }
    ]
  }
}

exports.getExtends = function (type = 'prettier', options) {
  const { pkg = {} } = options
  let baseExtends = configExtends.base

  // 获取Vue版本号并判断主版本号
  const vueVersion = pkg.dependencies?.vue || pkg.devDependencies?.vue
  if (vueVersion && vueVersion.match(/^\^?3/)) {
    baseExtends = configExtends.baseVue3
  }
  pinoSharedTips.info(`Vue version: ${vueVersion}`)
  if (type === 'base') {
    return baseExtends
  }
  return [...baseExtends, ...configExtends[type]]
}

exports.getRules = function (type = 'prettier', options) {
  if (type === 'base') {
    return configRules[type]
  }
  return {
    ...configRules.base,
    ...configRules[type]
  }
}

/**
 * @param {string} type - The type of eslint config.
 * @param {object} options - The options of eslint config.
 * @param {object} options.pkg - The package.json of project.
 * @returns {object} - The eslint config.
 */
exports.extendEslintConfig = function (type = 'prettier', options = {}) {
  // Recommend to use prettier in team.
  if (type !== 'prettier') {
    pinoSharedTips.warn(`Recommend to use 'prettier' setting in eslint config.`)
  }
  return {
    lintExtends: exports.getExtends(type, options),
    lintRules: exports.getRules(type, options)
  }
}
