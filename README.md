## 分支说明
* build-ts-use-ttypescript：使用ttsc生成类型声明文件，使用ttsc生成js。
  - 此乃最初的默认分支，其他分支皆基于此分支修改而来。
  - ts官方建议用tsc生成类型声明文件，用babel生成js。
* build-ts-use-babel：使用ttsc生成类型声明文件，使用babel生成js。
  - 遵从官方建议，使用babel生成js。
  - 但是babel仅能用来处理ts和js类型的文件，无法用来处理其他类型的文件。
  - 为了寻求更多的可能性，我引入了gulp。
* build-ts-use-gulp-typescript：使用ttsc生成类型声明文件，使用gulp-typescript生成js。
  - 使用gulp-typescript生成js的速度太慢了。
  - 所以我把gulp-typescript更换成了gulp-babel。
* build-ts-use-gulp-babel：使用ttsc生成类型声明文件，使用gulp-babel生成js。
  - 此乃现在的默认分支。
  - 此分支后续会继续维护，其他分支，停止维护。

## 把ts打包成js
* 把ts打包成js需要使用`gulp`命令。
* 使用`gulp`命令需要`gulp-cli`包和`gulp`包和`gulp-babel`包和`@babel/preset-env`包（含`@babel/core`包和`@babel/plugin-transform-modules-commonjs`包）和`@babel/plugin-transform-typescript`包和`gulpfile.ts`配置文件。

## 配置alias
* 配置alias需要`babel-plugin-module-resolver`包和`typescript-transform-paths`包。

## 使用ts写jest
* 使用ts写jest需要`ts-jest`包和`jest.config.ts`配置文件。
* 让`jest`命令识别alias需要在`jest.config.ts`中配置`moduleNameMapper`。

## 删除dist目录
* 删除dist目录需要`del`包。

## 直接运行ts
* 直接运行ts需要`ts-node`包。
* 让`ts-node`命令识别alias需要`tsconfig-paths`包。

## 限制`git commit`格式
* 限制`git commit`格式需要`husky`包和`@commitlint/config-conventional`包和`commitlint.config.js`配置文件和`commit-msg`脚本文件。

## 使用`git cz`取代`git commit`
* 使用`git cz`取代`git commit`只需`npm i -g git-cz`即可。

## 使用eslint检测ts
* 使用eslint检测ts需要`eslint`包和`@typescript-eslint/eslint-plugin`包和`.eslintrc.js`配置文件。
* 使用standard规范需要`eslint-config-standard`包。

## 对暂存区的git文件进行fix
* 对暂存区的git文件进行fix需要`husky`包和`lint-staged`包和`lint-staged.config.js`配置文件和`pre-commit`脚本文件。

## 使用`conventional-changelog`命令生成`CHANGELOG.md`文件
* 使用`conventional-changelog`命令生成`CHANGELOG.md`文件需要`conventional-changelog-cli`包。
#### 初始化内容：`npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0`。
* 不仅可在git打tag之后使用（会生成全部tag的feat和fix）。
  - 操作时需要先对package.json的version字段进行自增，然后打tag，最后运行上述命令。
* 也可以在git打tag之前使用（会生成自上次tag后的feat和fix）。
  - 操作时需要先对package.json的version字段进行自增，然后运行上述命令，最后打tag。
#### 追加新内容：`npx conventional-changelog -p angular -i CHANGELOG.md -s`。
* 只可以在git打tag之前使用（会生成自上次tag后的feat和fix）。
  - 操作时需要先对package.json的version字段进行自增，然后运行上述命令，最后打tag。
#### 注意事项：git的tag需要是v开头的格式。
* 例：`git tag v2.0.0 -m "标签的注释"`。
#### 最佳实践：保持版本号的一致性。
* 例：如果package.json的version字段是`2.0.0`，那么git打tag时就要打成`v2.0.0`。
