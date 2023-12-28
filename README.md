> 本项目是基于 https://github.com/zhouhuafei/npm-publish-ts/tree/build-ts-use-gulp-babel 项目改造

## 把静态资源上传到七牛云进行存储
```javascript
const { fnInit, fnDeleteFiles, fnUploadFiles, fnRefreshUrls } = require('qiniu-upload-dist')

// 开发环境 or 生产环境
const env = process.argv[2] || 'development'

// 七牛云的配置
const qiNiuConfig = {
  accessKey: '', // 必填 - 七牛的AK。
  secretKey: '', // 必填 - 七牛的SK。
  bucket: 'development', // 必填 - 七牛的空间名称。
  cname: 'https://development.xyz.com', // 必填|非必填 - 七牛的空间域名 - 若触发刷新文件方法则必填 - 若不触发则非必填。
  expires: 7200 // 非必填 - uploadToken的有效期，此处设置的是2个小时（7200秒），默认是1个小时（3600秒）。
}
if (env === 'production') {
  qiNiuConfig.bucket = 'production'
  qiNiuConfig.cname = 'https://production.xyz.com'
}

async function run () {
  // 初始化 - bucketManager、formUploader、cdnManager
  await fnInit(qiNiuConfig)

  // 删除文件 - 因上传不支持强制性覆盖上传，所以在上传前要先删除掉想要覆盖的文件。
  await fnDeleteFiles([
    'cjdg/index.html',
    'cjdg/favicon.ico'
  ])

  // 上传文件 - 不支持强制性覆盖上传 - 文件名称不变，内容不变，上传会提示成功 - 文件名称不变，内容改变，上传会提示失败
  await fnUploadFiles({
    // fast-glob的配置
    fastGlobConfig: [
      // ['./dist/**/*.*', '!./dist/**/*.html'], // 上传dist目录中所有的文件，除了以.html结尾的文件。
      ['./dist/**/*.*'], // 上传dist目录中所有的文件。
      { dot: true } // 使之支持上传dist目录中，以.开头的文件，例如.editorconfig文件。
    ],
    // 以 dist 目录中的 css/app.19a8a3b7.css 文件为例
    // 如果 pathPrefix 为 '' 则文件的存储路径为 css/app.19a8a3b7.css
    // 如果 pathPrefix 为 'cjdg' 则文件的存储路径为 cjdg/css/app.19a8a3b7.css
    // 如果 pathPrefix 为 'project1/h5/dist' 则文件的存储路径为 project1/h5/dist/css/app.19a8a3b7.css
    pathPrefix: 'cjdg'
  })

  // 刷新文件 - 刷新文件的CDN缓存，直接输入需要刷新的，文件的访问全路径即可。例如：https://www.xyz.com/index.html
  await fnRefreshUrls([
    `${qiNiuConfig.cname}/cjdg/index.html`,
    `${qiNiuConfig.cname}/cjdg/favicon.ico`
  ])
}

run()
```
