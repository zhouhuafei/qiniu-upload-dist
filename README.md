> 本项目是基于 https://github.com/zhouhuafei/npm-publish-ts/tree/build-ts-use-gulp-babel 项目改造

## 把静态资源上传到七牛云进行存储
```javascript
const { upload } = require('qiniu-upload-dist')

upload({
  fastGlobConfig: [
    ['./dist/**/*.*', '!./dist/**/*.html'], // 上传dist目录中所有的文件，除了以.html结尾的文件。
    { dot: true } // 使之支持上传dist目录中，以.开头的文件，例如.editorconfig文件。
  ],
  qiniuConfig: {
    accessKey: '', // 必填 - 七牛的Ak。
    secretKey: '', // 必填 - 七牛的Sk。
    bucket: '', // 必填 - 七牛的空间名称。
    cname: '', // 非必填 - 七牛的空间域名。
    expires: 7200 // 非必填 - token的有效期，此处设置的是2个小时（7200秒），默认是1个小时（3600秒）。
  },
  // 以 dist 目录中的 css/app.19a8a3b7.css 文件为例
  // 如果 pathPrefix 为 '' 则文件的存储路径为 css/app.19a8a3b7.css
  // 如果 pathPrefix 为 'project1/h5/dist' 则文件的存储路径为 project1/h5/dist/css/app.19a8a3b7.css
  pathPrefix: 'project1/h5/dist'
})
```
