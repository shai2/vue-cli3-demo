const path = require("path");
const webpack = require('webpack')

module.exports = {
  // 基本路径
  publicPath: "./",
  // 输出文件目录
  outputDir: "dist",
  filenameHashing: false, //静态资源不加hash
  // eslint-loader 是否在保存的时候检查
  lintOnSave: false,
  // webpack配置
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: () => { },
  configureWebpack: config => {
    if (process.env.NODE_ENV === "production") {
      // 为生产环境修改配置...
      config.mode = "production";
    } else {
      // 为开发环境修改配置...
      config.mode = "development";
    }

    return {
      // 开发生产共同配置
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
          "@public": path.resolve(__dirname, "./public"),
          "@c": path.resolve(__dirname, "./src/components"),
          "@assets": path.resolve(__dirname, "./src/assets"),
          "@api": path.resolve(__dirname, "./src/api/api"),
          "@img": path.resolve(__dirname, "./src/assets/img"),
          "@lib": path.resolve(__dirname, "./src/lib"),
          "@views": path.resolve(__dirname, "./src/views"),
          "@tools": path.resolve(__dirname, "./src/lib/js/tools"),
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery",
          "windows.jQuery": "jquery"
        })
      ]
    };
  },
  // 是否生成 sourceMap 文件
  // TODO:生成map文件 上线改false
  productionSourceMap: true,
  // css相关配置
  css: {
    // 开启 CSS source maps?
    sourceMap: true,
    // css预设器配置项
    loaderOptions: {},
    // 启用 CSS modules for all css / pre-processor files.
    modules: false
  },
  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  parallel: require("os").cpus().length > 1,
  // PWA 插件相关配置
  // see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  pwa: {},
  // webpack-dev-server 相关配置
  devServer: {
    open: true,
    host: "sit04-im.yimifudao.com",
    port: 9999,
    https: false,
    disableHostCheck: true,
    hotOnly: false,
    // proxy: {
    //  // 设置代理
    //  // proxy all requests starting with /api to jsonplaceholder
    //  'http://localhost:8080/': {
    //      target: 'http://baidu.com:8080', //真实请求的目标地址
    //      changeOrigin: true,
    //      pathRewrite: {
    //          '^http://localhost:8080/': ''
    //      }
    //  }
    // },
    before: app => { }
  },
  // 第三方插件配置
  pluginOptions: {
    // ...
  }
};