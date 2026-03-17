import { callApiWithToken } from "@/utils/api";

/**
 * 获取情侣信息
 * @param {Object} params - 查询参数
 * @param {string} params.userId - 用户ID
 * @returns {Promise} - 返回情侣信息
 */
export const getCoupleInfo = async (params) => {
  return callApiWithToken({
    name: "couple",
    data: {
      action: "getCouple",
      ...params,
    },
  });
};

/**
 * 绑定情侣关系
 * @param {Object} params - 绑定参数
 * @param {string} params.userId - 用户ID
 * @param {string} params.partnerPhone - 对方手机号
 * @returns {Promise} - 返回绑定结果
 */
export const bindCouple = async (params) => {
  return callApiWithToken({
    name: "couple",
    data: {
      action: "bind",
      ...params,
    },
  });
};

/**
 * 解除情侣关系
 * @param {Object} params - 解除参数
 * @param {string} params.userId - 用户ID
 * @returns {Promise} - 返回解除结果
 */
export const unbindCouple = async (params) => {
  return callApiWithToken({
    name: "couple",
    data: {
      action: "unbind",
      ...params,
    },
  });
};

/**
 * 获取情侣备忘录
 * @param {Object} params - 查询参数
 * @param {string} params.userId - 用户ID
 * @returns {Promise} - 返回情侣备忘录列表
 */
export const getCoupleMemos = async (params) => {
  return callApiWithToken({
    name: "couple",
    data: {
      action: "getCoupleMemos",
      ...params,
    },
  });
};
