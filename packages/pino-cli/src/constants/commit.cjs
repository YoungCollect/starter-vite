// 日志顺序会按照此枚举顺序排序
exports.COMMIT_TYPES = {
  feat: {
    icon: '✨',
    title: 'Features'
  },
  fix: {
    icon: '🐛',
    title: 'Bug Fixes'
  },
  perf: {
    icon: '⚡',
    title: 'Performance Improvements'
  },
  revert: {
    icon: '⏪',
    title: 'Revert'
  },
  docs: {
    icon: '✏️',
    title: 'Documentation'
  },
  style: {
    icon: '💄',
    title: 'Styles'
  },
  refactor: {
    icon: '♻️',
    title: 'Code Refactoring'
  },
  test: {
    icon: '✅',
    title: 'Tests'
  },
  build: {
    icon: '📦‍',
    title: 'Build System'
  },
  chore: {
    icon: '🚀',
    title: 'Chores'
  },
  ci: {
    icon: '👷',
    title: 'Continuous Integration'
  }
}

exports.getChangelogType = type => {
  const target = exports.COMMIT_TYPES[type]
  return target ? `${target.icon} ${target.title}` : ''
}

exports.getCommitType = type => {
  const target = exports.COMMIT_TYPES[type]
  return target ? `${target.icon} ${type}` : type
}

const commitTypes = Object.keys(exports.COMMIT_TYPES)

exports.extendCommitlintConfig = function (
  type = 'conventional',
  { emoji = false } = {}
) {
  if (emoji || type == 'emoji') {
    // return {
    //   lintExtends: ['gitmoji'],
    //   lintRules: {
    //     'type-enum': [
    //       2,
    //       'always',
    //       [...commitTypes]
    //       // [...commitTypes.map(type => exports.getCommitType(type))]
    //     ]
    //   }
    // }
  }

  return {
    lintExtends: ['@commitlint/config-conventional'],
    lintRules: {
      'type-enum': [2, 'always', [...commitTypes, 'release']]
    }
  }
}
