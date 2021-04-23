/* 基本的 配置文件 */
module.exports = {
  formatTypes: [
    { format: 'esm', min: false, suffix: '.js'},
    { format: 'esm', min: true, suffix: '.min.js'},
  ],
  // 不需要 打入包的 第三方文件
  /* 在本地依赖代码时，不能忽略 掉  'hammerjs', 'jquery'*/
  // external: ['vue', 'moment', 'element-plus'],
  /* 发布的 npm 上的时候，可以忽略，因为 在依赖的时候 会根据 dependencies 的内容进行安装 */
  external: ['vue', 'moment', 'element-plus', 'hammerjs', 'jquery'],
  distDir: '../lib', // 输出的 目录文件
  srcDir: '../src',
  assetFileNames: "icons/[name][extname]" // 对于静态资源的处理
}