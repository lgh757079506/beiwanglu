// 云函数入口文件
const cloud = require("wx-server-sdk");

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const memoCollection = db.collection("memos");

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data, token } = event;

  try {
    // 调用common云函数根据token获取用户信息
    const userInfoResult = await cloud.callFunction({
      name: "common",
      data: {
        action: "getUserInfoByToken",
        token,
      },
    });

    if (!userInfoResult.result.success) {
      return {
        success: false,
        message: userInfoResult.result.message || "登录已过期，请重新登录",
      };
    }

    const { userId } = userInfoResult.result.data;

    switch (action) {
      case "add":
        return await addMemo(data, userId);
      case "update":
        return await updateMemo(data, userId);
      case "delete":
        return await deleteMemo(data, userId);
      case "getList":
        return await getMemoList(userId);
      default:
        return {
          success: false,
          message: "未知操作",
        };
    }
  } catch (error) {
    console.error("操作失败:", error);
    return {
      success: false,
      message: "操作失败，请稍后重试",
    };
  }
};

// 添加备忘录
async function addMemo(data, userId) {
  const result = await memoCollection.add({
    data: {
      ...data,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "添加成功",
    data: {
      id: result._id,
    },
  };
}

// 更新备忘录
async function updateMemo(data, userId) {
  const { id, ...updateData } = data;

  // 验证备忘录是否属于当前用户
  const memoResult = await memoCollection.doc(id).get();
  if (!memoResult.data || memoResult.data.userId !== userId) {
    return {
      success: false,
      message: "无权操作此备忘录",
    };
  }

  await memoCollection.doc(id).update({
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "更新成功",
  };
}

// 删除备忘录
async function deleteMemo(data, userId) {
  const { id } = data;

  // 验证备忘录是否属于当前用户
  const memoResult = await memoCollection.doc(id).get();
  if (!memoResult.data || memoResult.data.userId !== userId) {
    return {
      success: false,
      message: "无权操作此备忘录",
    };
  }

  await memoCollection.doc(id).remove();

  return {
    success: true,
    message: "删除成功",
  };
}

// 获取备忘录列表
async function getMemoList(userId) {
  const result = await memoCollection
    .where({
      userId: userId,
    })
    .orderBy("createdAt", "desc")
    .get();

  return {
    success: true,
    message: "获取成功",
    data: result.data,
  };
}
