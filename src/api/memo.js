import { callApiWithToken } from "@/utils/api";

/**
 * 获取备忘录列表
 * @param {Object} params - 查询参数
 * @param {string} params.userId - 用户ID
 * @returns {Promise} - 返回备忘录列表
 */
export const getMemoList = async (params) => {
  return callApiWithToken({
    name: "memo",
    data: {
      action: "getList",
      ...params,
    },
  });
};

/**
 * 添加备忘录
 * @param {Object} params - 备忘录参数
 * @param {string} params.userId - 用户ID
 * @param {string} params.title - 标题
 * @param {string} params.content - 内容
 * @returns {Promise} - 返回添加结果
 */
export const addMemo = async (params) => {
  return callApiWithToken({
    name: "memo",
    data: {
      action: "add",
      ...params,
    },
  });
};

/**
 * 更新备忘录
 * @param {Object} params - 更新参数
 * @param {string} params.id - 备忘录ID
 * @param {string} params.title - 标题
 * @param {string} params.content - 内容
 * @returns {Promise} - 返回更新结果
 */
export const updateMemo = async (params) => {
  return callApiWithToken({
    name: "memo",
    data: {
      action: "update",
      ...params,
    },
  });
};

/**
 * 删除备忘录
 * @param {Object} params - 删除参数
 * @param {string} params.id - 备忘录ID
 * @returns {Promise} - 返回删除结果
 */
export const deleteMemo = async (params) => {
  return callApiWithToken({
    name: "memo",
    data: {
      action: "delete",
      ...params,
    },
  });
};

/**
 * 完成备忘录
 * @param {Object} params - 完成参数
 * @param {string} params.id - 备忘录ID
 * @returns {Promise} - 返回完成结果
 */
export const completeMemo = async (params) => {
  return callApiWithToken({
    name: "memo",
    data: {
      action: "complete",
      ...params,
    },
  });
};

/**
 * 获取历史备忘录
 * @param {Object} params - 查询参数
 * @param {string} params.userId - 用户ID
 * @returns {Promise} - 返回历史备忘录列表
 */
export const getMemoHistory = async (params) => {
  return callApiWithToken({
    name: "memo",
    data: {
      action: "getHistory",
      ...params,
    },
  });
};
