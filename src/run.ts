import { name, version } from '@/utils/package'

console.log('name：', name)
console.log('version：', version)

;(async function () {
  const { sum } = await import('@/utils/sum')
  console.log('sum：', sum(1, 2))
})()

;(async function () {
  const { sleep } = await import('@/utils/sleep')
  const ms = 3000
  console.log(`sleep：${ms}ms before`)
  await sleep(ms)
  console.log(`sleep：${ms}ms after`)
})()
