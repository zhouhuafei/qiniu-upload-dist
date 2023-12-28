import qiniu from 'qiniu'
import fg from 'fast-glob'

interface UploadConfig {
  fastGlobConfig: [string[], fg.Options]
  pathPrefix: string
}

// isInitSuccess
let isInitSuccess = true
// qiNiuConfig
let qiNiuConfig: any
// mac
let mac: any
// uploadToken
let uploadToken = ''
// bucketManager、formUploader、cdnManager
let bucketManager: any
let formUploader: any
let cdnManager: any
// putExtra
let putExtra: any
// uploadConfig
let uploadConfig: UploadConfig

// 初始化 - bucketManager、formUploader、cdnManager
async function fnInit (myQiNiuConfig) {
  // qiNiuConfig
  qiNiuConfig = myQiNiuConfig

  const accessKey = qiNiuConfig.accessKey
  if (!accessKey) {
    isInitSuccess = false
    return console.log('accessKey必填')
  }

  const secretKey = qiNiuConfig.secretKey
  if (!secretKey) {
    isInitSuccess = false
    return console.log('secretKey必填')
  }

  const bucket = qiNiuConfig.bucket
  if (!bucket) {
    isInitSuccess = false
    return console.log('bucket必填')
  }

  // mac
  mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

  // uploadToken
  const expires = qiNiuConfig.expires || 3600
  const returnBody = '{"name":$(fname),"path":"$(key)","size":$(fsize),"mimeType":"$(mimeType)","bucket":$(bucket)}'
  const options = { scope: bucket, expires, returnBody }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  uploadToken = putPolicy.uploadToken(mac)

  // bucketManager、formUploader、cdnManager
  const config: any = new qiniu.conf.Config()
  config.zone = qiniu.zone.Zone_z0
  bucketManager = new qiniu.rs.BucketManager(mac, config)
  formUploader = new qiniu.form_up.FormUploader(config)
  cdnManager = new qiniu.cdn.CdnManager(mac)

  // putExtra
  putExtra = new qiniu.form_up.PutExtra()

  return {
    bucketManager,
    formUploader,
    cdnManager
  }
}

// 删除所有文件 - 因上传不支持强制性覆盖上传，所以在上传前要先删除掉想要覆盖的文件。
async function fnDeleteFiles (keys: string[]) {
  if (!isInitSuccess) return console.log('未成功初始化，请检查参数后重试')

  const all = []
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    all.push(_fnDeleteOneFile(key))
  }
  return Promise.all(all)
}

// 删除单个文件 - 因上传不支持强制性覆盖上传，所以在上传前要先删除掉想要覆盖的文件。
function _fnDeleteOneFile (key) {
  return new Promise((resolve) => {
    bucketManager.delete(qiNiuConfig.bucket, key, function (err, respBody, respInfo) {
      if (err) {
        console.log('删除出错', err)
        resolve('failure')
      } else {
        if (respInfo.statusCode === 200) {
          console.log('删除成功', respInfo.statusCode)
        } else {
          console.log('删除失败', respInfo.statusCode, respBody)
        }
        resolve('success')
      }
    })
  })
}

// 上传所有文件 - 不支持强制性覆盖上传 - 文件名称不变，内容不变，上传会提示成功 - 文件名称不变，内容改变，上传会提示失败
async function fnUploadFiles (myUploadConfig: UploadConfig) {
  if (!isInitSuccess) return console.log('未成功初始化，请检查参数后重试')

  uploadConfig = myUploadConfig
  const entries = await fg(...uploadConfig.fastGlobConfig)
  const all = []
  for (let i = 0; i < entries.length; i++) {
    all.push(_fnUploadOneFile(entries[i]))
  }
  return Promise.all(all)
}

// 上传单个文件 - 不支持强制性覆盖上传 - 文件名称不变，内容不变，上传会提示成功 - 文件名称不变，内容改变，上传会提示失败
async function _fnUploadOneFile (localFilePath) {
  const pathPrefix = uploadConfig.pathPrefix || ''
  let key: any = localFilePath.split('/').filter(v => (v !== '.'))
  if (pathPrefix) {
    key[0] = pathPrefix
  } else {
    key.shift()
  }
  key = key.join('/')
  return new Promise((resolve) => {
    formUploader.putFile(uploadToken, key, localFilePath, putExtra, (respErr, respBody, respInfo) => {
      if (respErr) {
        console.log('上传出错', '本地文件路径', localFilePath, respErr)
        return resolve('failure')
      }
      if (respInfo.statusCode === 200) {
        console.log('上传成功', '本地文件路径', localFilePath, '远程文件路径', `${qiNiuConfig.cname}/${respBody.path}`)
        resolve('success')
      } else {
        console.log('上传失败', '本地文件路径', localFilePath, respInfo.statusCode, respBody)
        resolve('failure')
      }
    })
  })
}

// 刷新文件 - 刷新文件的CDN缓存，直接输入需要刷新的，文件的访问全路径即可。例如：https://www.xyz.com/index.html
function fnRefreshUrls (urlsToRefresh: string[]) {
  if (!isInitSuccess) return console.log('未成功初始化，请检查参数后重试')

  if (!urlsToRefresh.length) return
  return new Promise((resolve) => {
    cdnManager.refreshUrls(urlsToRefresh, function (err, respBody, respInfo) {
      if (err) {
        console.log('刷新出错', err)
        return resolve('failure')
      }
      if (respInfo.statusCode === 200) {
        console.log('刷新成功', respInfo.statusCode)
        resolve('success')
      } else {
        console.log('刷新失败', respInfo.statusCode, respBody)
        resolve('failure')
      }
    })
  })
}

export { fnInit, fnDeleteFiles, fnUploadFiles, fnRefreshUrls }
