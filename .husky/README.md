## commitlint踩坑
#### commitlint官方文档如下
```
npm install --save-dev husky

npx husky init

# Add commit message linting to commit-msg hook
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
# Windows users should use ` to escape dollar signs
echo "npx --no commitlint --edit `$1" > .husky/commit-msg
```
#### commit-msg踩坑
* 遇到问题：Windows系统，按照上述文档生成的commit-msg文件。
  - 运行`git commit`命令会报错。报错信息如下：
  ```
  .husky/commit-msg: .husky/commit-msg: cannot execute binary file
  husky - commit-msg script failed (code 126)
  ```
* 解决问题：从`.husky/_`目录复制出一份commit-msg文件。
  - 然后把里面的内容替换为`npx --no -- commitlint --edit $1`。
  - 注意上述命令中的`--`参数不要省略，否则还是会报错，官方文档中应是漏写了。
  - 再次运行`git commit`命令，就可以正常使用了。
#### 相关依赖
* "husky": "^9.1.7"
* "@commitlint/cli": "^19.7.1"
* "@commitlint/config-conventional": "^19.7.1"
