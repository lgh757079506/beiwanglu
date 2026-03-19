// 云函数入口文件
const cloud = require("wx-server-sdk");

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const usersCollection = db.collection("users");
const tokensCollection = db.collection("tokens");

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, phone, password } = event;

  // 处理退出登录
  if (action === "logout") {
    try {
      // 从event中获取token
      const token = event.token;
      if (!token) {
        return {
          success: false,
          message: "缺少token",
        };
      }

      // 从token表中移除该token
      await tokensCollection.where({ token }).remove();

      return {
        success: true,
        message: "退出登录成功",
      };
    } catch (error) {
      console.error("退出登录失败:", error);
      return {
        success: false,
        message: "退出登录失败，请稍后重试",
      };
    }
  }

  // 处理登录/注册
  try {
    // 1. 校验手机号是否合法
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return {
        success: false,
        message: "请输入正确的手机号",
      };
    }

    // 2. 校验密码是否存在
    if (!password || password.trim() === "") {
      return {
        success: false,
        message: "密码不能为空",
      };
    }

    // 3. 查找用户是否存在
    const userResult = await usersCollection
      .where({
        phone: phone,
      })
      .get();

    let userId;

    if (userResult.data.length > 0) {
      // 4. 用户已存在，验证密码
      const user = userResult.data[0];
      if (user.password === password) {
        userId = user._id;
      } else {
        // 密码错误
        return {
          success: false,
          message: "密码错误",
        };
      }
    } else {
      // 3. 校验密码强度（字母加数字，不得小于8位）
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
        return {
          success: false,
          message: "密码格式不正确，必须包含字母和数字，且长度不少于8位",
        };
      }
      // 5. 用户不存在，自动注册
      const addResult = await usersCollection.add({
        data: {
          phone: phone,
          password: password,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      userId = addResult._id;
    }

    // 6. 调用common云函数生成token
    const tokenResult = await cloud.callFunction({
      name: "common",
      data: {
        action: "generateToken",
        userId,
        phone,
      },
    });

    if (!tokenResult.result.success) {
      return {
        success: false,
        message: "生成token失败",
      };
    }

    const { token } = tokenResult.result.data;

    // 7. 生成8位用户唯一id值（使用userId的后8位）
    const uniqueId = userId.slice(-8);

    // 登录成功
    return {
      success: true,
      message: userResult.data.length > 0 ? "登录成功" : "注册并登录成功",
      data: {
        userId,
        uniqueId,
        phone,
        token,
      },
    };
  } catch (error) {
    console.error("登录/注册失败:", error);
    return {
      success: false,
      message: "登录/注册失败，请稍后重试",
    };
  }
};
