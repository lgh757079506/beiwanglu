import { defineStore } from "pinia";
import Taro from "@tarojs/taro";
import { login, logout } from "@/api/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userInfo: null,
    token: null,
    isLogin: false,
    coupleId: null,
    partnerId: null,
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,
    getToken: (state) => state.token,
    getIsLogin: (state) => state.isLogin,
    getCoupleId: (state) => state.coupleId,
    getPartnerId: (state) => state.partnerId,
  },

  actions: {
    // 登录
    async login(phone, password) {
      try {
        const result = await login({
          phone,
          password,
        });

        if (result.success) {
          const { userId, uniqueId, token } = result.data;

          // 更新状态
          this.userInfo = {
            phone,
            userId,
            uniqueId,
          };
          this.token = token;
          this.isLogin = true;

          // 保存到本地存储
          Taro.setStorageSync("userInfo", {
            phone,
            userId,
            uniqueId,
            token,
          });

          return true;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("登录失败:", error);
        throw error;
      }
    },

    // 登出
    async logout() {
      try {
        // 调用退出登录API
        if (this.token) {
          await logout();
        }
      } catch (error) {
        console.error("退出登录失败:", error);
      } finally {
        // 清除状态
        this.userInfo = null;
        this.token = null;
        this.isLogin = false;

        // 清除本地存储
        Taro.removeStorageSync("userInfo");
      }
    },

    // 初始化登录状态
    initAuth() {
      const userInfo = Taro.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = {
          phone: userInfo.phone,
          userId: userInfo.userId,
          uniqueId: userInfo.uniqueId,
        };
        this.token = userInfo.token;
        this.isLogin = true;
        this.coupleId = userInfo.coupleId || null;
        this.partnerId = userInfo.partnerId || null;
      }
      console.log("初始化登录状态:", this);
    },

    // 检查登录状态
    checkLogin() {
      return this.isLogin;
    },

    // 设置情侣信息
    setCoupleInfo(coupleId, partnerId) {
      this.coupleId = coupleId;
      this.partnerId = partnerId;

      // 保存到本地存储
      const userInfo = Taro.getStorageSync("userInfo") || {};
      Taro.setStorageSync("userInfo", {
        ...userInfo,
        coupleId,
        partnerId,
      });
    },

    // 清除情侣信息
    clearCoupleInfo() {
      this.coupleId = null;
      this.partnerId = null;

      // 更新本地存储
      const userInfo = Taro.getStorageSync("userInfo") || {};
      delete userInfo.coupleId;
      delete userInfo.partnerId;
      Taro.setStorageSync("userInfo", userInfo);
    },
  },
});
