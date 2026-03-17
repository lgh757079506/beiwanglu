import Taro from '@tarojs/taro';

// 统一云函数调用工具
export const callCloudFunction = async (name, data) => {
  try {
    const result = await Taro.cloud.callFunction({
      name,
      data
    });
    
    // 检查返回结果
    if (result.result && !result.result.success) {
      // 处理token过期的情况
      if (result.result.message === '登录已过期，请重新登录') {
        // 清除本地存储的用户信息
        Taro.removeStorageSync('userInfo');
        // 跳转到登录页
        Taro.reLaunch({
          url: '/pages/login/index'
        });
        throw new Error('登录已过期，请重新登录');
      }
      // 其他错误
      throw new Error(result.result.message || '操作失败');
    }
    
    return result;
  } catch (error) {
    console.error('云函数调用失败:', error);
    // 处理网络错误等情况
    Taro.showToast({
      title: error.message || '网络错误，请稍后重试',
      icon: 'none'
    });
    throw error;
  }
};