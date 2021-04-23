module.exports = {
  "presets": [
    "@babel/preset-env"
  ],
  "plugins": [
    "@babel/plugin-transform-runtime",
    // ["component", {
    //   "libraryName": "element-ui",
    //   "styleLibraryName": "theme-chalk"
    // }]
    [
      "import",
      {
        "libraryName": "element-plus",
        "customStyleName": (name) => {
          // 由于 customStyleName 在配置中被声明的原因，`style: true` 会被直接忽略掉，
          // 如果你需要使用 scss 源文件，把文件结尾的扩展名从 `.css` 替换成 `.scss` 就可以了
          return `element-plus/lib/theme-chalk/${name}.css`;
        },
      },
    ]
  ],
  "ignore": [
    "node_modules/**"
  ]
}