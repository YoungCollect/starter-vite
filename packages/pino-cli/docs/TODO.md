
# @oneyoung/pino-cli@1.0

- [x]默认开启 `lint on commit`，如果要支持不同的`lint on save`规则，那么需要确认 `vite` `webpack` `Vue-cli` 的配置。（已添加提示）

- [ ] 兼容 `Vue3` 生态 `Vue2` 生态 `react` 生态

- [ ] `eslint` 模块拆分`Vue` `React` 以及 `Typescript`

- [ ] `eslint` 考虑升级最新版本

- [x] `release` 兼容根目录发布场景（不兼容，需要指定目录，推荐 `monorepo` 形式）

- [ ] 添加了 `commitlint-config-gitmoji`，但是存在两个问题，一是 `prepare-commit-msg` g钩子与 `extendCommitlintConfig` 函数是独立的，这样就会导致两处配置同时进行才会生效，二是加了`emoji` 的 `commit` 记录，默认的 `changelog` 暂时不支持筛选对应的 `headerPattern`，需要额外兼容。 综合上述两点，暂时默认禁用 `commit emoji`。
