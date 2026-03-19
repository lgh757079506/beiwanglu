// 云函数入口文件
const cloud = require("wx-server-sdk");
const crypto = require("crypto");

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const tokensCollection = db.collection("tokens");

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, ...params } = event;

  try {
    switch (action) {
      case "generateToken":
        return await generateToken(params);
      case "verifyToken":
        return await verifyToken(params);
      case "getUserInfoByToken":
        return await getUserInfoByToken(params);
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

// 生成token
async function generateToken(params) {
  const { userId, phone } = params;
  const secret = "couple-memo-secret-key";
  const payload = {
    userId,
    phone,
    exp: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 3个月有效期
  };
  const token = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  // 存储token到tokens表
  await tokensCollection.where({ userId }).remove();
  await tokensCollection.add({
    data: {
      userId,
      token,
      expireAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    },
  });

  return {
    success: true,
    data: { token },
  };
}

// 验证token
async function verifyToken(params) {
  const { userId, token } = params;

  if (!userId || !token) {
    return {
      success: false,
      data: { valid: false },
    };
  }

  const tokenResult = await tokensCollection.where({ userId, token }).get();

  if (tokenResult.data.length === 0) {
    return {
      success: false,
      data: { valid: false },
    };
  }

  const tokenData = tokenResult.data[0];
  if (tokenData.expireAt && new Date(tokenData.expireAt) < new Date()) {
    // Token已过期，删除过期token
    await tokensCollection.doc(tokenData._id).remove();
    return {
      success: false,
      data: { valid: false },
    };
  }

  return {
    success: true,
    data: { valid: true },
  };
}

// 根据token获取用户信息
async function getUserInfoByToken(params) {
  const { token } = params;

  if (!token) {
    return {
      success: false,
      message: "缺少token",
    };
  }

  // 从token表中查找token
  const tokenResult = await tokensCollection.where({ token }).get();

  if (tokenResult.data.length === 0) {
    return {
      success: false,
      message: "无效的token",
    };
  }

  const tokenData = tokenResult.data[0];
  if (tokenData.expireAt && new Date(tokenData.expireAt) < new Date()) {
    // Token已过期，删除过期token
    await tokensCollection.doc(tokenData._id).remove();
    return {
      success: false,
      message: "token已过期",
    };
  }

  // 返回用户ID
  return {
    success: true,
    data: { userId: tokenData.userId },
  };
}
