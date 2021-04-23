/**
 * 为了 让 rollup-plugin-img 在没有 文件的 情况下 不报错
 */
const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs')

const outputSrc = path.resolve(__dirname, '../lib')
// 删除 dist 文件以及 包含的 所有
rimraf(outputSrc, (res) => {
  if (!fs.existsSync(outputSrc)) {
    // 生成 dist 文件
    fs.mkdirSync(path.resolve(__dirname, '../lib'));
  }
})
