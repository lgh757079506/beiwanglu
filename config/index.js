import { defineConfig } from "@tarojs/cli";
import ComponentsPlugin from "unplugin-vue-components/webpack";
import NutUIResolver from "@nutui/auto-import-resolver";

import devConfig from "./dev";
import prodConfig from "./prod";

const path = require("path");

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig = {
    projectName: "托运端小程序",
    date: "2025-7-11",
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
    sass: {
      // 默认京东 APP 10.0主题 > @import "@nutui/nutui-taro/dist/styles/variables.scss";
      // 京东科技主题 > @import "@nutui/nutui-taro/dist/styles/variables-jdt.scss";
      // 京东B商城主题 > @import "@nutui/nutui-taro/dist/styles/variables-jdb.scss";
      // 京东企业业务主题 > @import "@nutui/nutui-taro/dist/styles/variables-jddkh.scss";
      data: `@import "@nutui/nutui-taro/dist/styles/variables.scss";`,
    },
    plugins: ["@tarojs/plugin-generator", "@tarojs/plugin-html"],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: "vue3",
    compiler: {
      type: "webpack5",
      prebundle: { enable: false },
    },
    cache: {
      enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      miniCssExtractPluginOption: {
        ignoreOrder: true,
      },
      ignore: ["cloudfunctions/**/*"],
      postcss: {
        pxtransform: {
          enable: true,
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.plugin("unplugin-vue-components").use(
          ComponentsPlugin({
            resolvers: [NutUIResolver({ taro: true })],
          })
        );
      },
    },
  };

  process.env.BROWSERSLIST_ENV = process.env.NODE_ENV;

  if (process.env.NODE_ENV === "development") {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
