// 此处的配置 是打印[conventional-changelog-angular@7.0.0](https://www.npmjs.com/package/conventional-changelog-angular/v/7.0.0?activeTab=code)所得 可在此进行定向拓展 并且该项目可在dependencies中移除依赖

const {
  COMMIT_TYPES,
  getChangelogType
} = require('~pino-cli/constants/commit.cjs')

const compareFunc = (a, b) => {
  // 按照提交时间排序
  return new Date(b.committerDate) - new Date(a.committerDate)
}

const getTypeOrder = commitGroup => {
  // 根据表情符号标题反查原始类型
  const originalType = Object.entries(COMMIT_TYPES).find(
    ([_, value]) => getChangelogType(_) === commitGroup.title
  )?.[0]
  // 如果找到原始类型，返回其在 COMMIT_TYPES 中的索引，否则返回最大值
  return originalType
    ? Object.keys(COMMIT_TYPES).indexOf(originalType)
    : Number.MAX_SAFE_INTEGER
}

const compareGroups = (a, b) => {
  return getTypeOrder(a) - getTypeOrder(b)
}

const baseConfig = {
  parserOpts: {
    headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
    headerCorrespondence: ['type', 'scope', 'subject'],
    noteKeywords: ['BREAKING CHANGE'],
    revertPattern:
      /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
    revertCorrespondence: ['header', 'hash']
  },
  writerOpts: {
    transform: (commit, context) => {
      let discard = true
      const issues = []

      commit.notes.forEach(note => {
        note.title = 'BREAKING CHANGES'
        discard = false
      })

      if (commit.revert) {
        commit.type = getChangelogType('revert')
      } else if (COMMIT_TYPES[commit.type]) {
        commit.type = getChangelogType(commit.type)
      } else if (discard) {
        return
      }

      if (commit.scope === '*') {
        commit.scope = ''
      }

      if (typeof commit.hash === 'string') {
        commit.shortHash = commit.hash.substring(0, 7)
      }

      if (typeof commit.subject === 'string') {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl
        if (url) {
          url = `${url}/issues/`
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue)
            return `[#${issue}](${url}${issue})`
          })
        }
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
            (_, username) => {
              if (username.includes('/')) {
                return `@${username}`
              }

              return `[@${username}](${context.host}/${username})`
            }
          )
        }
      }
      // remove references that already appear in the subject
      commit.references = commit.references.filter(reference => {
        if (issues.indexOf(reference.issue) === -1) {
          return true
        }

        return false
      })

      return commit
    },
    groupBy: 'type',
    commitGroupsSort: compareGroups,
    commitsSort: compareFunc,
    noteGroupsSort: 'title',
    notesSort: compareFunc,
    mainTemplate:
      '{{> header}}\n' +
      '\n' +
      '{{#each commitGroups}}\n' +
      '\n' +
      '{{#if title}}\n' +
      '### {{title}}\n' +
      '\n' +
      '{{/if}}\n' +
      '{{#each commits}}\n' +
      '{{> commit root=@root}}\n' +
      '{{/each}}\n' +
      '\n' +
      '{{/each}}\n' +
      '{{> footer}}\n' +
      '\n' +
      '\n',
    headerPartial:
      '{{#if isPatch~}}\n' +
      '  ##\n' +
      '{{~else~}}\n' +
      '  #\n' +
      '{{~/if}} {{#if @root.linkCompare~}}\n' +
      '  [{{version}}](\n' +
      '  {{~#if @root.repository~}}\n' +
      '    {{~#if @root.host}}\n' +
      '      {{~@root.host}}/\n' +
      '    {{~/if}}\n' +
      '    {{~#if @root.owner}}\n' +
      '      {{~@root.owner}}/\n' +
      '    {{~/if}}\n' +
      '    {{~@root.repository}}\n' +
      '  {{~else}}\n' +
      '    {{~@root.repoUrl}}\n' +
      '  {{~/if~}}\n' +
      '  /compare/{{previousTag}}...{{currentTag}})\n' +
      '{{~else}}\n' +
      '  {{~version}}\n' +
      '{{~/if}}\n' +
      '{{~#if title}} "{{title}}"\n' +
      '{{~/if}}\n' +
      '{{~#if date}} ({{date}})\n' +
      '{{/if}}\n',
    commitPartial:
      '*{{#if scope}} **{{scope}}:**\n' +
      '{{~/if}} {{#if subject}}\n' +
      '  {{~subject}}\n' +
      '{{~else}}\n' +
      '  {{~header}}\n' +
      '{{~/if}}\n' +
      '\n' +
      '{{~!-- commit link --}} {{#if @root.linkReferences~}}\n' +
      '  ([{{shortHash}}](\n' +
      '  {{~#if @root.repository}}\n' +
      '    {{~#if @root.host}}\n' +
      '      {{~@root.host}}/\n' +
      '    {{~/if}}\n' +
      '    {{~#if @root.owner}}\n' +
      '      {{~@root.owner}}/\n' +
      '    {{~/if}}\n' +
      '    {{~@root.repository}}\n' +
      '  {{~else}}\n' +
      '    {{~@root.repoUrl}}\n' +
      '  {{~/if}}/\n' +
      '  {{~@root.commit}}/{{hash}}))\n' +
      '{{~else}}\n' +
      '  {{~shortHash}}\n' +
      '{{~/if}}\n' +
      '\n' +
      '{{~!-- commit references --}}\n' +
      '{{~#if references~}}\n' +
      '  , closes\n' +
      '  {{~#each references}} {{#if @root.linkReferences~}}\n' +
      '    [\n' +
      '    {{~#if this.owner}}\n' +
      '      {{~this.owner}}/\n' +
      '    {{~/if}}\n' +
      '    {{~this.repository}}#{{this.issue}}](\n' +
      '    {{~#if @root.repository}}\n' +
      '      {{~#if @root.host}}\n' +
      '        {{~@root.host}}/\n' +
      '      {{~/if}}\n' +
      '      {{~#if this.repository}}\n' +
      '        {{~#if this.owner}}\n' +
      '          {{~this.owner}}/\n' +
      '        {{~/if}}\n' +
      '        {{~this.repository}}\n' +
      '      {{~else}}\n' +
      '        {{~#if @root.owner}}\n' +
      '          {{~@root.owner}}/\n' +
      '        {{~/if}}\n' +
      '          {{~@root.repository}}\n' +
      '        {{~/if}}\n' +
      '    {{~else}}\n' +
      '      {{~@root.repoUrl}}\n' +
      '    {{~/if}}/\n' +
      '    {{~@root.issue}}/{{this.issue}})\n' +
      '  {{~else}}\n' +
      '    {{~#if this.owner}}\n' +
      '      {{~this.owner}}/\n' +
      '    {{~/if}}\n' +
      '    {{~this.repository}}#{{this.issue}}\n' +
      '  {{~/if}}{{/each}}\n' +
      '{{~/if}}\n' +
      '\n',
    footerPartial:
      '{{#if noteGroups}}\n' +
      '{{#each noteGroups}}\n' +
      '\n' +
      '### {{title}}\n' +
      '\n' +
      '{{#each notes}}\n' +
      '* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}\n' +
      '{{/each}}\n' +
      '{{/each}}\n' +
      '\n' +
      '{{/if}}\n'
  }
}

module.exports = {
  ...baseConfig,
  recommendedBumpOpts: {
    parserOpts: baseConfig.parserOpts,
    whatBump: function createConventionalRecommendedBumpOpts(parserOpts) {
      return {
        parserOpts,

        whatBump(commits) {
          let level = 2
          let breakings = 0
          let features = 0

          commits.forEach(commit => {
            if (commit.notes.length > 0) {
              breakings += commit.notes.length
              level = 0
            } else if (commit.type === 'feat') {
              features += 1
              if (level === 2) {
                level = 1
              }
            }
          })

          return {
            level,
            reason:
              breakings === 1
                ? `There is ${breakings} BREAKING CHANGE and ${features} features`
                : `There are ${breakings} BREAKING CHANGES and ${features} features`
          }
        }
      }
    }
  },
  conventionalChangelog: baseConfig
}
