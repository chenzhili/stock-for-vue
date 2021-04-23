const { join } = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin') //引入插件
const path = require('path')

module.exports = {
  outputDir: 'dist',
  // lintOnSave: !utils.isProduct,
  runtimeCompiler: true,
  productionSourceMap: false,
  pages: {
    index: {
      entry: 'example/main.js',
      template: 'example/index.html',
      filename: 'index.html',
    },
  },
  css: {
    extract: true,
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  // 扩展 webpack 配置，使 packages 加入编译
  chainWebpack: (config) => {
    config.module
      .rule('js')
      .include.add(join(process.cwd(), 'lib'))
      .end()
    // 关闭利用空余带宽加载文件 提升首页速度
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  },
  configureWebpack: {
    // plugins: [
    //   new CopyWebpackPlugin([
    //     {
    //       from: path.resolve(__dirname, 'lib/assets'),
    //       to: path.resolve(__dirname, 'dist/assets'),
    //     },
    //   ]),
    // ],
  },
  devServer: {
    contentBase: path.join(__dirname, './lib'),
    // 端口号
    port: 8099,
    // eslint报错页面会被遮住
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  pluginOptions: {
    lintStyleOnBuild: true,
    stylelint: {},
  },
}
