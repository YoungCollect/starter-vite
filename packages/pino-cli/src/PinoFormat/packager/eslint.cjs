const deepmerge = require('deepmerge')

const eslintExtensions = ['.js', '.jsx', '.vue', '.cjs', '.mjs']

function hasBabelCore(pkg = {}) {
  // @babel/eslint-parser in the .eslintrc.js depend on @babel/core
  const devDependencies = pkg?.devDependencies
  return devDependencies && devDependencies['@babel/core']
}

function getEslintExtendDeps(pkg, { type = 'prettier' }) {
  // See more at https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-plugin-eslint/eslintDeps.js
  const baseDeps = {
    eslint: '^7.32.0',
    'eslint-plugin-vue': '^8.0.3',
    '@babel/eslint-parser': '^7.25.9'
  }
  if (!hasBabelCore(pkg)) {
    baseDeps['@babel/core'] = '^7.22.15'
    baseDeps['@babel/preset-env'] = '^7.22.15'
    baseDeps['@babel/plugin-transform-runtime'] = '^7.22.15'
    baseDeps['@babel/runtime-corejs3'] = '^7.22.15'
  }
  const standardDeps = {
    ...baseDeps,
    '@vue/eslint-config-standard': '^6.1.0',
    'eslint-plugin-import': '^2.25.3',
    'eslint-plugin-node': '^11.1.0',
    'eslint-plugin-promise': '^5.1.0'
  }
  const prettierDeps = {
    ...baseDeps,
    'eslint-config-prettier': '^9.0.0',
    'eslint-plugin-prettier': '^5.0.1',
    prettier: '3.0.3'
  }
  const deps = {
    base: baseDeps,
    standard: standardDeps,
    prettier: prettierDeps
  }
  return {
    devDependencies: deps[type]
  }
}

function getEslintTriggerDeps(pkg, { type = 'commit', bundler }) {
  const extensions = eslintExtensions.map(ext => ext.replace(/^\./, ''))
  // yorkie has been in the dependencies of @vue/cli-plugin-eslint, so we don't need declare it in this project's dependencies.
  const lintOnCommitDeps = {
    devDependencies: {
      // yorkie-pnpm fix the bug of pnpm because of the sub-node_modules https://github.com/yyx990803/yorkie/pull/8
      'yorkie-pnpm': '^2.0.1',
      'lint-staged': '^11.1.2'
    },
    gitHooks: {
      'pre-commit': 'lint-staged'
    },
    'lint-staged': {
      // 使用--config指定根目录下配置文件 并结合--no-eslintrc 防止lint-staged时eslint使用template-cjs下的.eslintrc配置文件
      [`*.{${extensions.join(',')}}`]:
        'eslint --fix --config .eslintrc.cjs --no-eslintrc'
      // bundler === 'vue-cli-service' ? 'vue-cli-service format:lint' : 'npm run format:lint'
    }
  }
  const deps = {
    save: {},
    commit: lintOnCommitDeps
  }
  return deps[type]
}

function extendEslintDeps(pkg, options) {
  return deepmerge(pkg, getEslintExtendDeps(pkg, options))
}

function extendEslintScripts(pkg, options) {
  /*
		1. 不考虑集成vue-cli-service或者vite
		2. 当执行pino format prettier 或者 pino format eslint 时，会提示手动集成第三方工具
	*/
  return deepmerge(pkg, {
    scripts: {
      format: 'npm run format:lint && npm run format:pretty',
      'format:lint': `eslint . --ext ${eslintExtensions.join(
        ','
      )} --fix --config .eslintrc.cjs --no-eslintrc`,
      'format:pretty': 'prettier . --write'
    }
  })
}

function openLintOnSave(pkg) {
  // Configure 'lintOnSave' in vue.config.js
}

function openLintOnCommit(pkg, options) {
  return deepmerge(
    pkg,
    getEslintTriggerDeps(pkg, { type: 'commit', ...options })
  )
}

module.exports = {
  extendEslintDeps,
  extendEslintScripts,
  openLintOnSave,
  openLintOnCommit
}
