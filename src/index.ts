import qiniu from 'qiniu'
import fg from 'fast-glob'

interface UploadConfig {
  fastGlobConfig: [string[], fg.Options]
  qiniuConfig: any,
  pathPrefix: string
}

async function upload (uploadConfig: UploadConfig) {
  const entries = await fg(...uploadConfig.fastGlobConfig)
  entries.forEach(localFilePath => uploadQiniu(localFilePath, uploadConfig))
}

// 七牛 - token
let uploadQiniuToken = ''

// 七牛 - 上传 - 函数封装
function uploadQiniu (localFilePath, uploadConfig) {
  const qiniuConfig = uploadConfig.qiniuConfig
  const accessKey = qiniuConfig.accessKey
  if (!qiniuConfig.accessKey) return console.log('accessKey必填')
  const secretKey = qiniuConfig.secretKey
  if (!qiniuConfig.secretKey) return console.log('secretKey必填')
  const scope = qiniuConfig.bucket
  if (!qiniuConfig.bucket) return console.log('bucket必填')
  const expires = qiniuConfig.expires || 3600
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  const returnBody = '{"name":$(fname),"path":"$(key)","size":$(fsize),"mimeType":"$(mimeType)","bucket":$(bucket)}'
  const options = { scope, expires, returnBody }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  if (!uploadQiniuToken) uploadQiniuToken = putPolicy.uploadToken(mac)
  uploadQiniuFile(localFilePath, uploadQiniuToken, uploadConfig)
}

// 七牛 - 上传 - 上传文件
function uploadQiniuFile (localFilePath, uploadQiniuToken, uploadConfig) {
  const qiniuConfig = uploadConfig.qiniuConfig
  const config: any = new qiniu.conf.Config()
  config.zone = qiniu.zone.Zone_z0
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()
  const pathPrefix = uploadConfig.pathPrefix || ''
  let key = localFilePath.split('/').filter(v => (v !== '.'))
  if (pathPrefix) {
    key[0] = pathPrefix
  } else {
    key.shift()
  }
  key = key.join('/')
  formUploader.putFile(uploadQiniuToken, key, localFilePath, putExtra, (respErr, respBody, respInfo) => {
    if (respErr) {
      return console.log('失败', '本地文件路径', localFilePath, respErr)
    }
    if (respInfo.statusCode === 200) {
      console.log('成功', '本地文件路径', localFilePath)
      if (qiniuConfig.cname) console.log('成功', '远程文件路径', `${qiniuConfig.cname}/${respBody.path}`)
    } else {
      console.log('异常', '本地文件路径', localFilePath, respInfo.statusCode, respBody)
    }
  })
}

export { upload }
