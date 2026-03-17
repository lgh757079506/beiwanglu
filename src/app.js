import { createApp } from "vue";
import Taro from "@tarojs/taro";

import ThemeProvider from "@/components/theme-provider/index.vue";
import pinia from "./store/index";
import { useAuthStore } from "./store/auth";

import "./app.scss";

// 检查登录态
const checkLoginStatus = () => {
  const authStore = useAuthStore();
  return authStore.checkLogin();
};

// 路由拦截
const routerInterceptor = (options) => {
  // 不需要登录的页面
  const whiteList = ["/pages/index/index"];
  const url = options.url || "";

  // 检查是否在白名单中
  const isInWhiteList = whiteList.some((path) => url.includes(path));

  if (!isInWhiteList && !checkLoginStatus()) {
    // 未登录，重定向到登录页
    Taro.reLaunch({
      url: "/pages/login/index",
    });
    return false;
  }
  return true;
};

const App = createApp({
  onShow(options) {
    // 初始化登录状态
    const authStore = useAuthStore();
    authStore.initAuth();
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
  onLaunch() {
    // 监听路由跳转
    Taro.addInterceptor({
      invoke(options) {
        return routerInterceptor(options);
      },
      success() {},
      fail() {},
      complete() {},
    });
  },
});

App.component("ThemeProvider", ThemeProvider);
App.use(pinia);

// 关键：小程序启动时初始化云开发（与原生小程序 app.js 一致）
if (typeof wx !== "undefined" && wx.cloud) {
  // 初始化云开发
  wx.cloud.init({
    env: "cloudbase-7gwcvbldd56d4244", // 替换为你的小程序云环境ID
    traceUser: true, // 开启用户访问跟踪，自动记录用户云操作行为
  });
}

export default App;
