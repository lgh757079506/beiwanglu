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
    // 获取当前时间
    const now = new Date();
    console.log("开始执行提醒检查任务，当前时间:", now);

    // 计算当前时间窗口：当前时间到下一分钟
    const nextMinute = new Date(now.getTime() + 1 * 60 * 1000);
    console.log("当前时间窗口:", now, "至", nextMinute);

    // 查询所有未完成且设置了完成时间和提醒时间的备忘录
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
      })
      .get();

    console.log("找到需要检查的备忘录:", memoResult.data.length);

    // 遍历备忘录，检查是否需要发送提醒
    let remindedCount = 0;

    for (const memo of memoResult.data) {
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

      // 计算提醒时间：deadline时间减去提前提醒的分钟数
      const completeDateTime = new Date(completeTime);
      const remindDateTime = new Date(
        completeDateTime.getTime() - remindTime * 60 * 1000
      );

      // 转换为东八区时间字符串以便日志查看
      const getLocalTimeString = (date) => {
        const localDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return localDate.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      };

      console.log(`备忘录 ${memoId} - 到期时间(UTC): ${completeDateTime}`);
      console.log(
        `备忘录 ${memoId} - 到期时间(本地): ${getLocalTimeString(
          completeDateTime
        )}`
      );
      console.log(`备忘录 ${memoId} - 提前提醒时间: ${remindTime}分钟`);
      console.log(`备忘录 ${memoId} - 实际提醒时间(UTC): ${remindDateTime}`);
      console.log(
        `备忘录 ${memoId} - 实际提醒时间(本地): ${getLocalTimeString(
          remindDateTime
        )}`
      );

      // 检查提醒时间是否在当前时间窗口内（当前时间到下一分钟）
      // 这样可以确保每分钟执行一次时不会错过提醒
      console.log(
        "检查提醒时间是否在当前时间窗口内（当前时间到下一分钟）",
        now,
        nextMinute,
        remindDateTime
      );
      if (now <= remindDateTime && remindDateTime < nextMinute) {
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
                  date9: { value: completeDateTime.toLocaleString("zh-CN") },
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
        remindedCount++;
      }
    }

    console.log("提醒检查任务执行完成，共发送提醒:", remindedCount);

    return {
      success: true,
      message: "提醒检查任务执行完成",
      data: {
        checkedCount: memoResult.data.length,
        remindedCount: remindedCount,
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
