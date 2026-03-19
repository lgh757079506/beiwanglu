import Taro from "@tarojs/taro";
import { useAuthStore } from "@/store/auth";

/**
 * 通用API调用函数
 * @param {Object} options - API调用选项
 * @param {string} options.name - 云函数名称
 * @param {Object} options.data - 调用参数
 * @returns {Promise} - 返回Promise对象
 */
export const callApi = async (options) => {
  try {
    // 显示加载中
    Taro.showLoading({
      title: "加载中...",
      mask: true,
    });

    const { name, data } = options;

    // 调用云函数
    const result = await Taro.cloud.callFunction({
      name,
      data,
    });

    // 隐藏加载中
    Taro.hideLoading();

    // 处理返回结果
    if (result.result.success) {
      return result.result;
    } else {
      // 处理业务错误
      Taro.showToast({
        title: result.result.message || "操作失败",
        icon: "none",
      });
      // throw new Error(result.result.message || "操作失败");
      return result.result;
    }
  } catch (error) {
    // 隐藏加载中
    Taro.hideLoading();

    // 处理网络或其他错误
    if (error.message === "未登录" || error.message.includes("token")) {
      // 跳转到登录页
      Taro.reLaunch({
        url: "/pages/login/index",
      });
    } else {
      Taro.showToast({
        title: error.message || "网络错误，请稍后重试",
        icon: "none",
      });
    }
    throw error;
  }
};

/**
 * 带token的API调用函数
 * @param {Object} options - API调用选项
 * @param {string} options.name - 云函数名称
 * @param {Object} options.data - 调用参数
 * @returns {Promise} - 返回Promise对象
 */
export const callApiWithToken = async (options) => {
  try {
    // 显示加载中
    Taro.showLoading({
      title: "加载中...",
      mask: true,
    });

    // 从store中获取token
    const authStore = useAuthStore();

    if (!authStore.isLogin || !authStore.token) {
      Taro.showToast({
        title: "请先登录",
        icon: "none",
      });
      throw new Error("未登录");
    }

    // 调用云函数时在data中携带token
    const result = await Taro.cloud.callFunction({
      name: options.name,
      data: {
        ...options.data,
        token: authStore.token,
      },
    });

    // 隐藏加载中
    Taro.hideLoading();

    // 处理返回结果
    if (result.result.success) {
      return result.result;
    } else {
      // 处理业务错误
      Taro.showToast({
        title: result.result.message || "操作失败",
        icon: "none",
      });

      // 处理网络或其他错误
      if (
        result.result.message === "未登录" ||
        result.result.message.includes("token")
      ) {
        // 跳转到登录页
        Taro.reLaunch({
          url: "/pages/login/index",
        });
      } else {
        Taro.showToast({
          title: result.result.message || "网络错误，请稍后重试",
          icon: "none",
        });
      }
      // throw new Error(result.result.message || "操作失败");
      return result.result;
    }
  } catch (error) {
    // 隐藏加载中
    Taro.hideLoading();

    // 处理网络或其他错误
    if (error.message === "未登录" || error.message.includes("token")) {
      // 跳转到登录页
      Taro.reLaunch({
        url: "/pages/login/index",
      });
    } else {
      Taro.showToast({
        title: error.message || "网络错误，请稍后重试",
        icon: "none",
      });
    }

    throw error;
  }
};

/**
 * 处理API错误
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误信息
 */
export const handleApiError = (error, defaultMessage = "操作失败") => {
  console.error("API错误:", error);
  Taro.showToast({
    title: error.message || defaultMessage,
    icon: "none",
  });
};

/**
 * 处理API成功
 * @param {string} message - 成功信息
 */
export const handleApiSuccess = (message = "操作成功") => {
  Taro.showToast({
    title: message,
    icon: "success",
  });
};
