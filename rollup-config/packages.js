/**
 * 实际 组件 配置
 */

// module.exports = {
//   index: {
//     // input: '' // 这个用 规则 生成 => index.js
//     // output: index
//   }
// }
/**
 * 实际生成 有 input，output
 */
const fs = require('fs')
const path = require('path')

const extReg = /\.[\s\S]+$/;
const files = fs.readdirSync(path.resolve(__dirname, '../src')).map(filename => (filename.replace(extReg, '')));

/**
 * 需要 排除的 文件
 */
const whiteList = {
  kLineGraphH5: 1,
  kLineGraphPC: 1,
  timeSharingH5: 1,
  timeSharingPC: 1,
  index: 1
}

module.exports = files.filter(file => whiteList[file])