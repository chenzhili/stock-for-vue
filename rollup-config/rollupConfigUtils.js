/**
 * 这是 rollup 的 核心 函数
 */
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const { babel } = require('@rollup/plugin-babel')
const eslint = require('@rollup/plugin-eslint')
const json = require('@rollup/plugin-json')
const vuePlugin = require('rollup-plugin-vue')
const postcss = require('rollup-plugin-postcss')
const postcssPresetEnv = require('postcss-preset-env')
const simplevars = require('postcss-simple-vars')
const nested = require('postcss-nested')
const cssnano = require('cssnano')
const cssnext = require('postcss-cssnext')
const url = require('@rollup/plugin-url')
// const dynamicImportVars = require('@rollup/plugin-dynamic-import-vars'); // 写法不支持 commonjs 模块
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'

const { terser } = require('rollup-plugin-terser')
const font = require('rollup-plugin-font')

const RC = require('rollup-plugin-require-context')

const path = require('path')
const rollup = require('rollup')
const chalk = require('chalk')
const scss  = require('rollup-plugin-scss');

// 证明是 打包 还是 调试阶段 prod 和 watch
const createType = process.env.NODE_ENV;
console.log('创建方式', createType)
/**
 * 生成 plugins 的 配置
 * @param {*} min 是否需要 压缩
 */
const genPlugins = (min) => {
  const basePlugins = [
    // 这个一定 要在开始位置
    vuePlugin({
      css: false,
    }),
    // scss(),
    commonjs(), // 这样 Rollup 能转换 `ms` 为一个ES模块
    nodeResolve({
      extensions: ['.js', '.vue', '.json'],
    }), // 这样 Rollup 能找到 `ms`
    // css相关修改
    postcss({
      modules: true,
      plugins: [
        postcssPresetEnv(),
        simplevars(),
        nested(),
        cssnext({ warnForDuplicates: false }),
        min ? cssnano() : '', // 压缩的
      ],
      use: [['sass']],
      inject: false,
      // sourceMap: true,
      extensions: ['.css', '.scss'],
      extract: true, // 输出路径
    }),
    
    RC(),
    json(),
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ['../src/**'],
      exclude: ['node_modules/**'],
    }),
    babel({
      exclude: 'node_modules/**',
      // 使plugin-transform-runtime生效
      babelHelpers: 'runtime',
      extensions: ['.vue' /* ,'.js' // 不能引入 */], // 必须
    }),

    dynamicImportVars(),
    // @rollup/plugin-url --- 替换所有的 文件 相关的 操作
    // url({
    //   destDir: path.resolve(__dirname, '../lib/assets'),
    //   exclude: ['node_modules/**', 'src/iconfont/**'],
    //   publicPath: './assets/',
    //   limit: 8192,
    // }),
    // 图标处理--- 用于 对于图标 引用import 的 解析
    // font({
    //   svg: path.resolve(__dirname, '../src/iconfont/iconfont.svg'),
    //   unicode: {
    //     include: [path.resolve(__dirname, '../src/iconfont/iconfont.woff')],
    //     prefix: 'icon-',
    //   },
    //   css: {
    //     include: [path.resolve(__dirname, '../src/iconfont/iconfont.css')],
    //     prefix: 'icon-',
    //     common: 'iconfont',
    //   },
    // }),
  ]
  // 是否需要 压缩
  if (min) {
    basePlugins.push(terser())
  }
  return basePlugins
}
/**
 * 提取 创建 需要的 公共参数
 * @param {*} config 
 */
const extractPublic = (config) => {
  const {
    srcDir,
    external,
    min,
    suffix,
    format,
    packagename,
    distDir,
    assetFileNames,
  } = config
  // 需要区分 是 index 还是 其他 文件
  const input = `${path.resolve(__dirname, srcDir)}\\${
    packagename === 'index' ? packagename : `${packagename}\\index`
  }.js`
  // console.log(input)
  const inputOptions = {
    // 核心参数
    input, // 唯一必填参数
    external,
    plugins: genPlugins(min),
  }
  const file = `${path.resolve(__dirname, distDir)}\\${
    packagename === 'index' ? packagename : `${packagename}\\index`
  }${suffix}`
  // console.log(file);
  const outputOptions = {
    // 核心参数
    file, // 若有bundle.write，必填
    format, // 必填
    name: packagename,
    assetFileNames,
    sourcemap: createType === 'watch' // 加入sourcemap，但是实际没有使用上有问题
  }
  return { inputOptions, outputOptions }
}
/**
 * 实际 构建 rollup 项目
 * @param {*} config 构建的关键信息
 */
const buildMain = async ({ inputOptions, outputOptions }) => {
  
  const bundle = await rollup.rollup(inputOptions)

  // console.log(bundle.imports); // an array of external dependencies
  // console.log(bundle.exports); // an array of names exported by the entry point
  // console.log(bundle.modules); // an array of module objects

  // generate code and a sourcemap
  // const { code, map } = await bundle.generate(outputOptions);

  // or write the bundle to disk
  await bundle.write(outputOptions)
}

/**
 * 调试项目
 * @param {*} param0 
 */
const watchMain = ({ inputOptions, outputOptions }) => {
  const watchOptions = {
    ...inputOptions,
    output: [outputOptions],
  }
  const watcher = rollup.watch(watchOptions);

  // watcher.on('event', (event) => {
  //   console.log(event.code)
  //   // event.code 会是下面其中一个：
  //   //   START        — 监听器正在启动（重启）
  //   //   BUNDLE_START — 构建单个文件束
  //   //   BUNDLE_END   — 完成文件束构建
  //   //   END          — 完成所有文件束构建
  //   //   ERROR        — 构建时遇到错误
  //   //   FATAL        — 遇到无可修复的错误
  // })
}
// cmd 提示 信息
const chalkConsole = {
  success: () => {
    console.log(chalk.green(`=========================================`))
    console.log(chalk.green(`========构建成功(build success)!=========`))
    console.log(chalk.green(`=========================================`))
  },
  building: (index, total) => {
    console.log(chalk.blue(`正在打包第${index}/${total}个文件...`))
  },
}
/**
 * 创建工程
 * @param {*} config 
 */
const createProj = (config) => {
  const configPub = extractPublic(config);
  const fn = createType === 'prod' ? buildMain : watchMain;
  fn(configPub)
}

/**
 * 打包
 * @param {*} config
 */
function buildProj(builds) {
  let buildCount = 0

  const total = builds.length
  const next = async () => {
    chalkConsole.building(buildCount + 1, total)
    // await buildMain(builds[buildCount])
    await createProj(builds[buildCount])
    buildCount++
    buildCount < total ? next() : chalkConsole.success()
  }
  next()
}
module.exports = buildProj
