import { callApi, callApiWithToken } from "@/utils/api";

/**
 * 登录/注册
 * @param {Object} params - 登录参数
 * @param {string} params.phone - 手机号
 * @param {string} params.password - 密码
 * @returns {Promise} - 返回登录结果
 */
export const login = async (params) => {
  return callApi({
    name: "login",
    data: params,
  });
};

/**
 * 退出登录
 * @returns {Promise} - 返回退出结果
 */
export const logout = async () => {
  return callApiWithToken({
    name: "login",
    data: {
      action: "logout",
    },
  });
};

/**
 * 验证token
 * @param {Object} params - 验证参数
 * @param {string} params.token - 要验证的token
 * @returns {Promise} - 返回验证结果
 */
export const verifyToken = async (params) => {
  return callApi({
    name: "common",
    data: {
      action: "verifyToken",
      ...params,
    },
  });
};
