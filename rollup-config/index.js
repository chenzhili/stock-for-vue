/**
 * 实际 执行 rollup 的 地方
 */
const { formatTypes, external, distDir, assetFileNames, srcDir} = require('./config');
const packages = require('./packages');
const buildProj = require('./rollupConfigUtils');

const pkgs = [];
formatTypes.forEach(({ format, min, suffix }) => {
  packages.forEach(filename => {
    pkgs.push({srcDir, external, min, suffix, format, packagename: filename, distDir, assetFileNames})
  })
})
// console.log(pkgs);
buildProj(pkgs);