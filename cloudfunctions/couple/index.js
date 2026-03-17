// 云函数入口文件
const cloud = require("wx-server-sdk");

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const usersCollection = db.collection("users");
const couplesCollection = db.collection("couples");

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
      case "bind":
        return await bindCouple(data, userId);
      case "unbind":
        return await unbindCouple(userId);
      case "getCouple":
        return await getCouple(userId);
      case "getCoupleMemos":
        return await getCoupleMemos(userId);
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

// 绑定情侣关系
async function bindCouple(data, userId) {
  const { partnerPhone } = data;

  // 查找 partner 用户
  const partnerResult = await usersCollection
    .where({
      phone: partnerPhone,
    })
    .get();

  if (partnerResult.data.length === 0) {
    return {
      success: false,
      message: "对方用户不存在",
    };
  }

  const partnerId = partnerResult.data[0]._id;

  // 检查是否已经绑定
  const existingCouple = await couplesCollection
    .where({
      $or: [
        { userId1: userId, userId2: partnerId },
        { userId1: partnerId, userId2: userId },
      ],
    })
    .get();

  if (existingCouple.data.length > 0) {
    return {
      success: false,
      message: "已经绑定情侣关系",
    };
  }

  // 创建情侣关系
  await couplesCollection.add({
    data: {
      userId1: userId,
      userId2: partnerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "绑定成功",
  };
}

// 解除情侣关系
async function unbindCouple(userId) {
  // 查找情侣关系
  const coupleResult = await couplesCollection
    .where({
      $or: [{ userId1: userId }, { userId2: userId }],
    })
    .get();

  if (coupleResult.data.length === 0) {
    return {
      success: false,
      message: "未绑定情侣关系",
    };
  }

  // 删除情侣关系
  await couplesCollection.doc(coupleResult.data[0]._id).remove();

  return {
    success: true,
    message: "解除绑定成功",
  };
}

// 获取情侣信息
async function getCouple(userId) {
  // 查找情侣关系
  const coupleResult = await couplesCollection
    .where({
      $or: [{ userId1: userId }, { userId2: userId }],
    })
    .get();

  if (coupleResult.data.length === 0) {
    return {
      success: false,
      message: "未绑定情侣关系",
    };
  }

  const couple = coupleResult.data[0];
  const partnerId = couple.userId1 === userId ? couple.userId2 : couple.userId1;

  // 获取伴侣信息
  const partnerResult = await usersCollection.doc(partnerId).get();

  return {
    success: true,
    message: "获取成功",
    data: {
      partnerId: partnerId,
      partnerPhone: partnerResult.data.phone,
    },
  };
}

// 获取情侣备忘录
async function getCoupleMemos(userId) {
  // 查找情侣关系
  const coupleResult = await couplesCollection
    .where({
      $or: [{ userId1: userId }, { userId2: userId }],
    })
    .get();

  if (coupleResult.data.length === 0) {
    return {
      success: false,
      message: "未绑定情侣关系",
    };
  }

  const couple = coupleResult.data[0];
  const partnerId = couple.userId1 === userId ? couple.userId2 : couple.userId1;

  // 获取双方的备忘录
  const memoResult = await db
    .collection("memos")
    .where({
      userId: {
        $in: [userId, partnerId],
      },
    })
    .orderBy("createdAt", "desc")
    .get();

  return {
    success: true,
    message: "获取成功",
    data: memoResult.data,
  };
}
