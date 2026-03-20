// 云函数入口文件
const cloud = require("wx-server-sdk");

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const memoCollection = db.collection("memos");
const usersCollection = db.collection("users");
const couplesCollection = db.collection("couples");

// 通知模板ID
const NOTIFICATION_TEMPLATE_ID = "7x8CIIU_XGvd8WROzha6QkJTwPcvSGEFD3zQ4QOPSA9k";

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取调用来源
    const wxContext = cloud.getWXContext();
    const source = wxContext.SOURCE;

    console.log("开始执行提醒检查任务，调用来源:", source);

    // 获取当前时间
    const now = new Date();
    console.log("当前时间:", now);

    // 计算查询时间范围：当前时间到5分钟后（与执行频率匹配）
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
    console.log("查询时间范围:", now, "至", fiveMinutesLater);

    // 查询即将在5分钟内需要提醒的备忘录
    const memoResult = await memoCollection
      .where({
        isCompleted: false,
        completeTime: db.command.exists(true),
        remindTime: db.command.exists(true),
        remindTime: db.command.gt(0),
        // 还没有发送过提醒
        isReminded: db.command.or(
          db.command.exists(false),
          db.command.eq(false)
        ),
        // 计算提醒时间范围：completeTime - remindTime <= fiveMinutesLater
        // 转换为：completeTime <= fiveMinutesLater + remindTime
        // 使用where查询时需要转换逻辑
        // 实际查询：提醒时间在当前时间到5分钟后之间
        // 即：completeTime - remindTime >= now && completeTime - remindTime <= fiveMinutesLater
        // 转换为：completeTime >= now + remindTime && completeTime <= fiveMinutesLater + remindTime
        // 但云开发数据库不支持在where中直接进行数学运算，所以我们需要调整查询策略
        // 这里我们查询所有在未来5分钟内可能需要提醒的备忘录
        // 即：completeTime <= fiveMinutesLater + (max_remind_time)
        // 假设max_remind_time为1天（1440分钟）
        completeTime: db.command.lte(
          fiveMinutesLater.getTime() + 1440 * 60 * 1000
        ),
      })
      .get();

    // 如果没有需要处理的备忘录，直接返回，减少资源消耗
    if (memoResult.data.length === 0) {
      console.log("没有需要处理的备忘录，提前返回");
      return {
        success: true,
        message: "没有需要处理的备忘录",
        data: {
          checkedCount: 0,
        },
      };
    }

    console.log("找到需要检查的备忘录:", memoResult.data.length);

    // 过滤出真正需要在当前时间窗口内提醒的备忘录
    const memosToRemind = [];

    for (const memo of memoResult.data) {
      const { _id: memoId, completeTime, remindTime } = memo;

      // 计算提醒时间
      const completeDateTime = new Date(completeTime);
      const remindDateTime = new Date(
        completeDateTime.getTime() - remindTime * 60 * 1000
      );

      // 检查提醒时间是否在当前时间窗口内
      if (now <= remindDateTime && remindDateTime <= fiveMinutesLater) {
        memosToRemind.push(memo);
        console.log(
          `备忘录 ${memoId} 需要在当前时间窗口内提醒 - 提醒时间: ${remindDateTime}`
        );
      }
    }

    // 如果没有需要提醒的备忘录，直接返回
    if (memosToRemind.length === 0) {
      console.log("当前时间窗口内没有需要提醒的备忘录");
      return {
        success: true,
        message: "当前时间窗口内没有需要提醒的备忘录",
        data: {
          checkedCount: memoResult.data.length,
          remindedCount: 0,
        },
      };
    }

    console.log("需要提醒的备忘录数量:", memosToRemind.length);

    // 遍历需要提醒的备忘录
    for (const memo of memosToRemind) {
      const {
        _id: memoId,
        userId,
        coupleId,
        type,
        title,
        content,
        completeTime,
        remindTime,
      } = memo;

      // 计算提醒时间
      const completeDateTime = new Date(completeTime);
      const remindDateTime = new Date(
        completeDateTime.getTime() - remindTime * 60 * 1000
      );

      console.log(
        `处理提醒 - 备忘录 ${memoId} - 完成时间: ${completeDateTime}, 提醒时间: ${remindDateTime}`
      );

      // 发送通知
      console.log(`备忘录 ${memoId} 需要发送提醒`);

      // 获取需要通知的用户
      const usersToNotify = [];

      // 获取创建者信息
      const creatorResult = await usersCollection.doc(userId).get();
      if (creatorResult.data) {
        usersToNotify.push(creatorResult.data);
      }

      // 如果是情侣备忘录，获取另一半信息
      if (type === "couple" && coupleId) {
        const coupleResult = await couplesCollection.doc(coupleId).get();
        if (coupleResult.data) {
          const { userId1, userId2 } = coupleResult.data;
          const partnerId = userId === userId1 ? userId2 : userId1;

          const partnerResult = await usersCollection.doc(partnerId).get();
          if (partnerResult.data) {
            usersToNotify.push(partnerResult.data);
          }
        }
      }

      // 发送订阅通知
      for (const user of usersToNotify) {
        if (user.openid) {
          try {
            await cloud.openapi.subscribeMessage.send({
              touser: user.openid,
              templateId: NOTIFICATION_TEMPLATE_ID,
              page: `/pages/index/index?memoId=${memoId}`,
              data: {
                thing5: { value: title || "备忘录" },
                thing2: { value: content || "无内容" },
                date9: {
                  value: new Date(completeTime).toLocaleString("zh-CN"),
                },
              },
            });
            console.log(`向用户 ${user.openid} 发送提醒成功`);
          } catch (notifyError) {
            console.error(`向用户 ${user.openid} 发送提醒失败:`, notifyError);
          }
        }
      }

      // 更新备忘录状态为已提醒
      await memoCollection.doc(memoId).update({
        data: {
          isReminded: true,
          remindedAt: now,
        },
      });
      console.log(`备忘录 ${memoId} 已标记为已提醒`);
    }

    console.log("提醒检查任务执行完成");

    return {
      success: true,
      message: "提醒检查任务执行完成",
      data: {
        checkedCount: memoResult.data.length,
        remindedCount: memosToRemind.length,
      },
    };
  } catch (error) {
    console.error("执行提醒检查任务失败:", error);
    return {
      success: false,
      message: `执行提醒检查任务失败: ${error}`,
    };
  }
};
