import qiniu from 'qiniu'
import fg from 'fast-glob'

interface UploadConfig {
  preDeleteFiles: string[]
  urlsToRefresh: string[]
  fastGlobConfig: [string[], fg.Options]
  qiniuConfig: any,
  pathPrefix: string
}

// qiniuConfig
let qiniuConfig: any
// mac
let mac: any
// uploadQiniuToken
let uploadQiniuToken = ''
// bucketManager、formUploader
let bucketManager: any
let formUploader: any
// isInitSuccess
let isInitSuccess = true

async function fnInit (myQiniuConfig) {
  // qiniuConfig
  qiniuConfig = myQiniuConfig

  const accessKey = qiniuConfig.accessKey
  if (!accessKey) {
    isInitSuccess = false
    return console.log('accessKey必填')
  }

  const secretKey = qiniuConfig.secretKey
  if (!secretKey) {
    isInitSuccess = false
    return console.log('secretKey必填')
  }

  const bucket = qiniuConfig.bucket
  if (!bucket) {
    isInitSuccess = false
    return console.log('bucket必填')
  }

  // mac
  mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

  // uploadQiniuToken
  const expires = qiniuConfig.expires || 3600
  const returnBody = '{"name":$(fname),"path":"$(key)","size":$(fsize),"mimeType":"$(mimeType)","bucket":$(bucket)}'
  const options = { scope: bucket, expires, returnBody }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  if (!uploadQiniuToken) uploadQiniuToken = putPolicy.uploadToken(mac)

  // bucketManager、formUploader
  const config: any = new qiniu.conf.Config()
  config.zone = qiniu.zone.Zone_z0
  bucketManager = new qiniu.rs.BucketManager(mac, config)
  formUploader = new qiniu.form_up.FormUploader(config)
}

// 七牛 - 上传 - 函数封装
async function fnUploadQiniu (localFilePath, uploadConfig) {
  return await fnUploadQiniuFile(localFilePath, uploadQiniuToken, uploadConfig)
}

// 七牛 - 上传 - 上传文件
async function fnUploadQiniuFile (localFilePath, uploadQiniuToken, uploadConfig) {
  const putExtra = new qiniu.form_up.PutExtra()
  const pathPrefix = uploadConfig.pathPrefix || ''
  let key = localFilePath.split('/').filter(v => (v !== '.'))
  if (pathPrefix) {
    key[0] = pathPrefix
  } else {
    key.shift()
  }
  key = key.join('/')
  return await fnPutFile(formUploader, key, localFilePath, putExtra, qiniuConfig)
}

function fnPutFile (formUploader, key, localFilePath, putExtra, qiniuConfig) {
  return new Promise((resolve) => {
    formUploader.putFile(uploadQiniuToken, key, localFilePath, putExtra, (respErr, respBody, respInfo) => {
      if (respErr) {
        console.log('上传出错', '本地文件路径', localFilePath, respErr)
        return resolve('failure')
      }
      if (respInfo.statusCode === 200) {
        console.log('上传成功', '本地文件路径', localFilePath, '远程文件路径', `${qiniuConfig.cname}/${respBody.path}`)
        resolve('success')
      } else {
        console.log('上传失败', '本地文件路径', localFilePath, respInfo.statusCode, respBody)
        resolve('failure')
      }
    })
  })
}

async function fnDeleteFiles (keys) {
  if (!isInitSuccess) return

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    await fnDeleteOneFile(key)
  }
}

function fnDeleteOneFile (key) {
  return new Promise((resolve) => {
    bucketManager.delete(qiniuConfig.bucket, key, function (err, respBody, respInfo) {
      if (err) {
        console.log('删除出错', err)
        resolve('failure')
      } else {
        if (respInfo.statusCode === 200) {
          console.log('删除成功', respInfo.statusCode, respBody)
        } else {
          console.log('删除失败', respInfo.statusCode, respBody)
        }
        resolve('success')
      }
    })
  })
}

async function fnUpload (uploadConfig: UploadConfig) {
  const entries = await fg(...uploadConfig.fastGlobConfig)
  // for (let i = 0; i < uploadConfig.preDeleteFiles.length; i++) {
  //   const fileKey = uploadConfig.preDeleteFiles[i]
  //   await fnDeleteFiles(formUploader, bucket, key)
  // }
  for (let i = 0; i < entries.length; i++) {
    const localFilePath = entries[i]
    await fnUploadQiniu(localFilePath, uploadConfig)
  }
  // await fnRefreshUrls(uploadConfig.urlsToRefresh, mac)
}

function fnRefreshUrls (urlsToRefresh, mac) {
  if (!urlsToRefresh.length) return
  return new Promise((resolve) => {
    const cdnManager = new qiniu.cdn.CdnManager(mac)
    cdnManager.refreshUrls(urlsToRefresh, function (err, respBody, respInfo) {
      if (err) {
        console.log(err)
        return resolve('failure')
      }
      console.log(respInfo.statusCode)
      if (respInfo.statusCode === 200) {
        const jsonBody = JSON.parse(respBody)
        console.log(jsonBody.code)
        console.log(jsonBody.error)
        console.log(jsonBody.requestId)
        console.log(jsonBody.invalidUrls)
        console.log(jsonBody.invalidDirs)
        console.log(jsonBody.urlQuotaDay)
        console.log(jsonBody.urlSurplusDay)
        console.log(jsonBody.dirQuotaDay)
        console.log(jsonBody.dirSurplusDay)
        resolve('success')
      }
    })
  })
}

export { fnInit, fnDeleteFiles, fnUpload, fnRefreshUrls }
