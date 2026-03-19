// 云函数入口文件
const cloud = require("wx-server-sdk");

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const memoCollection = db.collection("memos");
const couplesCollection = db.collection("couples");

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, token, ...data } = event;

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
        return await getMemoList(userId, data);
      case "complete":
        return await completeMemo(data, userId);
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
      message: `操作失败，请稍后重试: ${error}`,
    };
  }
};

// 添加备忘录
async function addMemo(data, userId) {
  const { type } = data;
  let coupleId = null;

  // 如果是"我们"类型的备忘录，获取用户的绑定信息
  if (type === "couple") {
    const coupleResult = await couplesCollection
      .where({
        $or: [{ userId1: userId }, { userId2: userId }],
      })
      .get();

    if (coupleResult.data.length === 0) {
      return {
        success: false,
        message: "未绑定情侣关系，无法创建情侣备忘录",
      };
    }

    coupleId = coupleResult.data[0]._id;
  }

  const result = await memoCollection.add({
    data: {
      ...data,
      userId,
      coupleId, // 存储绑定信息的id
      isCompleted: false, // 默认未完成状态
      completedAt: null, // 完成时间
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

  // 验证备忘录是否属于当前用户或当前用户的情侣关系
  const memoResult = await memoCollection.doc(id).get();
  const memo = memoResult.data;

  if (!memo) {
    return {
      success: false,
      message: "备忘录不存在",
    };
  }

  // 检查是否有权限操作
  let hasPermission = false;

  if (memo.userId === userId) {
    // 是当前用户创建的备忘录
    hasPermission = true;
  } else if (memo.type === "couple" && memo.coupleId) {
    // 是情侣备忘录，检查当前用户是否在该绑定关系中
    const coupleResult = await couplesCollection
      .where({
        _id: memo.coupleId,
        $or: [{ userId1: userId }, { userId2: userId }],
      })
      .get();

    hasPermission = coupleResult.data.length > 0;
  }

  if (!hasPermission) {
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

  // 验证备忘录是否属于当前用户或当前用户的情侣关系
  const memoResult = await memoCollection.doc(id).get();
  const memo = memoResult.data;

  if (!memo) {
    return {
      success: false,
      message: "备忘录不存在",
    };
  }

  // 检查是否有权限操作
  let hasPermission = false;

  if (memo.userId === userId) {
    // 是当前用户创建的备忘录
    hasPermission = true;
  } else if (memo.type === "couple" && memo.coupleId) {
    // 是情侣备忘录，检查当前用户是否在该绑定关系中
    const coupleResult = await couplesCollection
      .where({
        _id: memo.coupleId,
        $or: [{ userId1: userId }, { userId2: userId }],
      })
      .get();

    hasPermission = coupleResult.data.length > 0;
  }

  if (!hasPermission) {
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

// 完成备忘录
async function completeMemo(data, userId) {
  const { id } = data;

  // 验证备忘录是否属于当前用户或当前用户的情侣关系
  const memoResult = await memoCollection.doc(id).get();
  const memo = memoResult.data;

  if (!memo) {
    return {
      success: false,
      message: "备忘录不存在",
    };
  }

  // 检查是否有权限操作
  let hasPermission = false;

  if (memo.userId === userId) {
    // 是当前用户创建的备忘录
    hasPermission = true;
  } else if (memo.type === "couple" && memo.coupleId) {
    // 是情侣备忘录，检查当前用户是否在该绑定关系中
    const coupleResult = await couplesCollection
      .where({
        _id: memo.coupleId,
        $or: [{ userId1: userId }, { userId2: userId }],
      })
      .get();

    hasPermission = coupleResult.data.length > 0;
  }

  if (!hasPermission) {
    return {
      success: false,
      message: "无权操作此备忘录",
    };
  }

  // 更新备忘录为已完成状态
  await memoCollection.doc(id).update({
    data: {
      isCompleted: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "标记完成成功",
  };
}

// 获取备忘录列表
async function getMemoList(userId, data) {
  const { type, isCompleted, sortBy } = data || {};
  let query;

  // 首先获取当前用户的绑定信息
  const coupleResult = await couplesCollection
    .where({
      $or: [{ userId1: userId }, { userId2: userId }],
    })
    .get();

  if (type === "couple") {
    // 查询"我们"类型的备忘录
    if (coupleResult.data.length === 0) {
      // 未绑定情侣关系，返回空列表
      return {
        success: true,
        message: "获取成功",
        data: [],
      };
    }

    const coupleId = coupleResult.data[0]._id;

    // 查询所有属于该绑定关系的备忘录
    query = memoCollection.where({
      coupleId: coupleId,
      ...(isCompleted !== undefined ? { isCompleted } : {}),
    });
  } else if (type === "personal") {
    // 查询"我的"类型的备忘录
    query = memoCollection.where({
      userId: userId,
      type: "personal",
      ...(isCompleted !== undefined ? { isCompleted } : {}),
    });
  } else {
    const coupleId = coupleResult.data[0]._id;
    // 查询所有类型的备忘录（包括"我们"和"我的"）
    query = memoCollection.where({
      $or: [
        {
          userId: userId,
          ...(isCompleted !== undefined ? { isCompleted } : {}),
        },
        {
          coupleId: coupleId,
          ...(isCompleted !== undefined ? { isCompleted } : {}),
        },
      ],
    });
  }

  // 移除后端排序，由前端负责排序

  const result = await query.get();

  return {
    success: true,
    message: "获取成功",
    data: result.data,
  };
}
