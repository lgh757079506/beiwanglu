<template>
  <ThemeProvider>
    <view class="memo-container">
      <!-- 背景装饰 -->
      <view class="bg-decoration">
        <view
          v-for="(emoji, index) in festivalEmojis"
          :key="index"
          class="heart"
          :class="'heart-' + (index + 1)"
        >{{ emoji }}</view>
      </view>

      <!-- 顶部标题区域 -->
      <view
        class="header"
        @dblclick="showRandomLoveMessage"
      >
        <view class="title-wrapper">
          <text class="title-emoji">{{ festivalEmoji }}</text>
          <text class="title">情侣备忘录</text>
          <text class="title-emoji">{{ festivalEmoji }}</text>
        </view>
        <view class="subtitle">{{ welcomeMessage }}</view>
      </view>

      <!-- 连续打卡奖励提示 -->
      <view
        v-if="showStreakReward"
        class="streak-reward"
      >
        <text class="streak-text">{{ streakRewardText }}</text>
      </view>

      <!-- 情侣绑定区域 -->
      <view class="couple-section">
        <view
          v-if="!coupleInfo"
          class="couple-bind"
        >
          <view class="bind-icon">🔗</view>
          <view class="bind-content">
            <text class="couple-label">绑定另一半</text>
            <view class="input-wrapper">
              <nut-input
                v-model="partnerPhone"
                type="tel"
                placeholder="输入对方手机号"
                maxlength="11"
                :border="false"
                class="couple-input"
              />
              <nut-button
                type="primary"
                size="small"
                @click="bindCouple"
                class="couple-btn"
              >绑定</nut-button>
            </view>
          </view>
        </view>
        <view
          v-else
          class="couple-info"
        >
          <view class="couple-avatars">
            <view class="avatar me">👩</view>
            <view class="love-icon">💗</view>
            <view class="avatar partner">👨</view>
          </view>
          <view class="couple-details">
            <text class="couple-status">已绑定</text>
            <nut-tag
              type="primary"
              class="couple-phone"
            >{{ coupleInfo.partnerPhone }}</nut-tag>
          </view>
          <nut-button
            type="danger"
            size="small"
            @click="unbindCouple"
            class="unbind-btn"
          >解除</nut-button>
        </view>
      </view>

      <!-- 添加备忘录按钮 -->
      <view
        class="add-btn"
        @click="showAddDialog = true"
      >
        <view class="add-icon">
          <text class="plus">+</text>
        </view>
        <!-- <text class="add-label">添加</text> -->
      </view>

      <!-- 切换备忘录视图 -->
      <view class="tabs-wrapper">
        <view
          class="tab-item"
          :class="{ active: !showCoupleMemos }"
          @click="showCoupleMemos = false"
        >
          <text class="tab-icon">📝</text>
          <text class="tab-text">我的</text>
        </view>
        <view class="tab-divider"></view>
        <view
          class="tab-item"
          :class="{ active: showCoupleMemos, disabled: !coupleInfo }"
          @click="coupleInfo && (showCoupleMemos = true)"
        >
          <text class="tab-icon">💑</text>
          <text class="tab-text">我们</text>
        </view>
      </view>

      <!-- 备忘录列表 -->
      <view class="memo-list-wrapper">
        <MemoList
          ref="memoListRef"
          :memos="memoList"
          :show-date="true"
          :show-actions="true"
          :current-user-id="userInfo.userId"
          :empty-text="randomEmptyText"
          timeTitle="计划完成时间"
          @edit="editMemo"
          @complete="handleComplete"
          @delete="deleteMemo"
          @memo-click="handleMemoClick"
          class="memo-list"
        />
      </view>

      <!-- 心形爆炸动画容器 -->
      <view
        v-if="showHeartExplosion"
        class="heart-explosion-container"
      >
        <view
          v-for="i in 20"
          :key="i"
          class="explosion-heart"
          :style="getExplosionStyle(i)"
        >💕</view>
      </view>

      <!-- 输入框小心心效果 -->
      <view
        v-if="showInputHearts"
        class="input-hearts-container"
      >
        <view
          v-for="(heart, index) in inputHearts"
          :key="index"
          class="floating-heart"
          :style="heart.style"
        >{{ heart.emoji }}</view>
      </view>

      <!-- 添加/编辑备忘录弹窗 -->
      <nut-dialog
        v-model:visible="showAddDialog"
        :title="editingMemo ? '✏️ 编辑备忘录' : '✨ 添加备忘录'"
        width="90%"
        :close-on-click-overlay="false"
        class="memo-dialog"
      >
        <scroll-view
          :scroll-y="true"
          style="height: 36vh;"
        >
          <nut-form
            ref="formRef"
            :model-value="formData"
            :rules="rules"
            label-position="top"
          >
            <nut-form-item
              label="📌 标题"
              prop="title"
              class="form-item"
            >
              <nut-input
                v-model="formData.title"
                placeholder="给备忘录起个名字..."
                :border="false"
                class="dialog-input"
                @input="checkLoveText('title')"
              />
            </nut-form-item>
            <nut-form-item
              label="💭 内容"
              prop="content"
              class="form-item"
            >
              <nut-textarea
                v-model="formData.content"
                placeholder="写下你想说的话..."
                rows="5"
                :border="false"
                class="dialog-textarea"
                @input="checkLoveText('content')"
              />
            </nut-form-item>
            <nut-form-item
              label="📅 完成时间"
              prop="completeTime"
              class="form-item"
            >
              <nut-cell
                :title="formatDate(formData.completeTime) || '选择完成时间'"
                is-link
                @click="openDatePicker"
                class="date-cell"
              >
                <template #icon>
                  <text class="cell-icon">🕐</text>
                </template>
              </nut-cell>
            </nut-form-item>

            <nut-form-item
              label="⏰ 提前提醒时间（分钟）"
              prop="remindTime"
              class="form-item"
            >
              <nut-input
                v-model="formData.remindTime"
                type="number"
                placeholder="输入提醒时间，不设置则不提醒"
                :border="false"
                class="remind-input"
              />
              <view class="quick-select">
                <nut-button
                  v-for="time in quickRemindTimes"
                  :key="time.value"
                  size="mini"
                  type="default"
                  @click="selectQuickRemind(time.value)"
                  :class="{ active: formData.remindTime == time.value }"
                >{{ time.label
                }}</nut-button>
              </view>
            </nut-form-item>
            <nut-form-item
              label="🏷️ 备忘录类型"
              prop="type"
              class="form-item"
            >
              <view class="type-selector">
                <view
                  class="type-option"
                  :class="{ active: formData.type === 'personal' }"
                  @click="formData.type = 'personal'"
                >
                  <text class="type-icon">👤</text>
                  <text class="type-text">我的</text>
                </view>
                <view
                  class="type-option"
                  :class="{ active: formData.type === 'couple' }"
                  @click="formData.type = 'couple'"
                >
                  <text class="type-icon">💕</text>
                  <text class="type-text">我们</text>
                </view>
              </view>
            </nut-form-item>
          </nut-form>
        </scroll-view>
        <template #footer>
          <nut-button
            type="default"
            @click="handleCancel"
            class="dialog-btn cancel-btn"
          >取消</nut-button>
          <nut-button
            type="primary"
            @click="handleSubmit"
            class="dialog-btn confirm-btn"
          >
            {{ editingMemo ? '保存修改' : '添加备忘录' }}
          </nut-button>
        </template>
      </nut-dialog>

      <!-- 日期选择器弹窗 -->
      <nut-popup
        v-model:visible="showDatePicker"
        position="bottom"
        round
        class="date-picker-popup"
      >
        <view class="picker-header">
          <text class="picker-title">选择日期时间</text>
        </view>
        <nut-date-picker
          v-model="formData.completeTime"
          type="datetime"
          :min-date="minDate"
          @confirm="showDatePicker = false"
          @cancel="showDatePicker = false"
        />
      </nut-popup>
    </view>
  </ThemeProvider>
</template>

<script setup>
import dayjs from 'dayjs'
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import { getMemoList, addMemo, updateMemo, deleteMemo as deleteMemoApi, completeMemo } from '@/api/memo'
import { getCoupleInfo, bindCouple as bindCoupleApi, unbindCouple as unbindCoupleApi, getCoupleMemos } from '@/api/couple'
import LoveFloat from '@/components/love-float/index.vue'
import MemoList from '@/components/memo-list/index.vue'
import './index.scss'

// 响应式数据
const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo || {})
const memoList = ref([])
const showAddDialog = ref(false)
const editingMemo = ref(null)
const memoListRef = ref(null)

// 快捷提醒时间选项
const quickRemindTimes = ref([
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 },
  { label: '2小时', value: 120 },
  { label: '半天', value: 720 },
  { label: '1天', value: 1440 }
])

// 表单数据
const formData = ref({
  title: '',
  content: '',
  completeTime: null,
  remindTime: '',
  type: 'personal'
})

// 表单引用
const formRef = ref(null)

// 表单校验规则
const rules = {
  title: [
    {
      required: true,
      message: '请输入标题',
      trigger: 'blur'
    }
  ],
  content: [
    {
      required: true,
      message: '请输入内容',
      trigger: 'blur'
    }
  ]
}
const coupleInfo = ref(null)
const partnerPhone = ref('')
const showCoupleMemos = ref(false)
const showDatePicker = ref(false)
const minDate = ref(new Date())

// 彩蛋相关数据
const memoClickCount = ref(0)
const lastMemoClickTime = ref(0)
const showHeartExplosion = ref(false)
const showInputHearts = ref(false)
const inputHearts = ref([])
const showStreakReward = ref(false)
const streakRewardText = ref('')

// 节日相关数据
const festivalEmoji = ref('💕')
const festivalEmojis = ref(['💕', '💗', '💖', '💝'])

// 温馨提示相关
const welcomeMessages = [
  '今天也要开心哦！',
  '记得想我~',
  '有你真好！',
  '每一天都值得被记录',
  '和你在一起的每一天都是好日子',
  '想你的第N天~',
  '一起记录我们的故事吧！'
]

const timeGreetings = {
  morning: '早安，亲爱的☀️',
  noon: '午安，记得吃饭🍱',
  evening: '晚安，想你🌙'
}

const randomEmptyTexts = [
  '快来记录我们的故事吧！',
  '这里等着我们填满💕',
  '开始写下我们的第一个备忘录吧~',
  '让我们一起创造更多回忆！',
  '今天有什么想记录的呢？'
]

const loveMessages = [
  '想你了💕',
  '爱你哦😘',
  '你最棒！',
  '么么哒~',
  '有你真好',
  '想抱抱你',
  '你是最可爱的！'
]

const romanticSuggestions = [
  '去看电影吧！',
  '一起做饭吧！',
  '去散散步吧~',
  '一起听歌吧！',
  '去吃好吃的！',
  '一起看星星吧~',
  '给对方一个拥抱！',
  '说一句我爱你💕'
]

// 计算属性
const welcomeMessage = computed(() => {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 9) {
    return timeGreetings.morning
  } else if (hour >= 12 && hour < 15) {
    return timeGreetings.noon
  } else if (hour >= 22) {
    return timeGreetings.evening
  } else {
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  }
})

const randomEmptyText = computed(() => {
  return randomEmptyTexts[Math.floor(Math.random() * randomEmptyTexts.length)]
})

/**
 * 下拉刷新处理
 */
const onPullDownRefresh = async () => {
  try {
    await loadCoupleInfo()
    await loadMemos()
  } finally {
    Taro.stopPullDownRefresh()
  }
}
usePullDownRefresh(onPullDownRefresh)

// 注册下拉刷新事件
Taro.pageScrollTo({ scrollTop: 0 })

// 暴露下拉刷新方法
defineExpose({
  onPullDownRefresh
})

/**
 * 页面加载时检查登录状态并加载备忘录
 */
onMounted(async () => {
  authStore.initAuth()
  await loadCoupleInfo()
  await loadMemos()
  checkFestival()
  initShake()
  checkStreak()
})

// 监听tab切换，重新加载数据
watch(
  () => showCoupleMemos.value,
  async (newValue) => {
    await loadMemos()
  }
)

onUnmounted(() => {
  Taro.offAccelerometerChange()
})

// 检查节日
const checkFestival = () => {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()

  if ((month === 2 && day === 14) || (month === 8 && day === 7)) {
    festivalEmoji.value = '💝'
    festivalEmojis.value = ['💝', '💕', '💗', '💖', '💘']
  } else if (month === 12 && day >= 20 && day <= 26) {
    festivalEmoji.value = '🎄'
    festivalEmojis.value = ['🎄', '🎅', '❄️', '⛄', '🎁']
  } else if (month === 1 && day >= 1 && day <= 7) {
    festivalEmoji.value = '🧧'
    festivalEmojis.value = ['🧧', '🎆', '🎇', '🎉', '🏮']
  } else {
    festivalEmoji.value = '💕'
    festivalEmojis.value = ['💕', '💗', '💖', '💝']
  }
}

// 初始化摇一摇
const initShake = () => {
  Taro.onAccelerometerChange((res) => {
    const speed = Math.abs(res.x) + Math.abs(res.y) + Math.abs(res.z)
    if (speed > 2.5) {
      showRandomSuggestion()
    }
  })
  Taro.startAccelerometer({ interval: 'normal' })
}

// 显示随机浪漫建议
const showRandomSuggestion = () => {
  const suggestion = romanticSuggestions[Math.floor(Math.random() * romanticSuggestions.length)]
  Taro.showModal({
    title: '💫 浪漫建议',
    content: suggestion,
    showCancel: false,
    confirmText: '好的！'
  })
}

// 检查连续打卡
const checkStreak = () => {
  const lastRecordDate = Taro.getStorageSync('lastRecordDate') || ''
  const today = dayjs().format('YYYY-MM-DD')
  let streak = parseInt(Taro.getStorageSync('streak') || '0')

  if (lastRecordDate === today) {
    return
  }

  if (lastRecordDate === dayjs().subtract(1, 'day').format('YYYY-MM-DD')) {
    streak += 1
  } else {
    streak = 1
  }

  Taro.setStorageSync('streak', streak.toString())
  Taro.setStorageSync('lastRecordDate', today)

  if (streak === 7) {
    showStreakReward.value = true
    streakRewardText.value = '💪 我们的默契值+100！'
    setTimeout(() => {
      showStreakReward.value = false
    }, 3000)
  } else if (streak === 30) {
    showStreakReward.value = true
    streakRewardText.value = '🎉 我们是最棒的情侣！'
    setTimeout(() => {
      showStreakReward.value = false
    }, 3000)
  }
}

// 显示随机情话
const showRandomLoveMessage = () => {
  const message = loveMessages[Math.floor(Math.random() * loveMessages.length)]
  Taro.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

// 处理备忘录点击
const handleMemoClick = (memo) => {
  const now = Date.now()
  if (now - lastMemoClickTime.value > 2000) {
    memoClickCount.value = 1
  } else {
    memoClickCount.value += 1
  }
  lastMemoClickTime.value = now

  if (memoClickCount.value >= 5) {
    triggerHeartExplosion()
    memoClickCount.value = 0
  }
}

// 触心形爆炸动画
const triggerHeartExplosion = () => {
  showHeartExplosion.value = true
  setTimeout(() => {
    showHeartExplosion.value = false
  }, 2000)
}

// 获取心形爆炸样式
const getExplosionStyle = (index) => {
  const angle = (index * 18) * Math.PI / 180
  const distance = 80 + Math.random() * 100
  const tx = Math.cos(angle) * distance
  const ty = Math.sin(angle) * distance
  return {
    left: '50%',
    top: '50%',
    '--tx': `${tx}px`,
    '--ty': `${ty}px`,
    animationDelay: `${index * 0.05}s`
  }
}

// 检查"我爱你"文本
const checkLoveText = (field) => {
  const text = formData.value[field] || ''
  if (text.includes('我爱你')) {
    triggerInputHearts()
  }
}

// 触发输入框小心心效果
const triggerInputHearts = () => {
  showInputHearts.value = true
  inputHearts.value = []

  for (let i = 0; i < 15; i++) {
    const heartEmojis = ['💕', '💗', '💖', '💝', '💘']
    inputHearts.value.push({
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
      style: {
        left: `${20 + Math.random() * 60}%`,
        animationDelay: `${i * 0.1}s`
      }
    })
  }

  setTimeout(() => {
    showInputHearts.value = false
  }, 2500)
}

// 更新打卡记录
const updateStreak = () => {
  const today = dayjs().format('YYYY-MM-DD')
  Taro.setStorageSync('lastRecordDate', today)

  let streak = parseInt(Taro.getStorageSync('streak') || '0')
  const lastRecordDate = Taro.getStorageSync('lastRecordDate') || ''

  if (lastRecordDate === dayjs().subtract(1, 'day').format('YYYY-MM-DD')) {
    streak += 1
  } else if (lastRecordDate !== today) {
    streak = 1
  }

  Taro.setStorageSync('streak', streak.toString())

  if (streak === 7) {
    showStreakReward.value = true
    streakRewardText.value = '💪 我们的默契值+100！'
    setTimeout(() => {
      showStreakReward.value = false
    }, 3000)
  } else if (streak === 30) {
    showStreakReward.value = true
    streakRewardText.value = '🎉 我们是最棒的情侣！'
    setTimeout(() => {
      showStreakReward.value = false
    }, 3000)
  }
}

/**
 * 加载情侣信息
 */
const loadCoupleInfo = async () => {
  try {
    console.log('加载情侣信息...')
    const result = await getCoupleInfo({})

    if (result.success) {
      coupleInfo.value = result.data
      // 将绑定信息存储到store
      authStore.setCoupleInfo(result.data.coupleId, result.data.partnerId)
    }
  } catch (error) {
    console.error('加载情侣信息失败:', error)
  }
}

/**
 * 绑定情侣关系
 */
const bindCouple = async () => {
  if (!partnerPhone.value) {
    Taro.showToast({
      title: '请输入对方手机号',
      icon: 'none'
    })
    return
  }

  if (!/^1[3-9]\d{9}$/.test(partnerPhone.value)) {
    Taro.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  if (!userInfo.value.userId) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  try {
    const result = await bindCoupleApi({
      partnerPhone: partnerPhone.value
    })

    if (result.success) {
      await loadCoupleInfo()
      Taro.showToast({
        title: '绑定成功 💕',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('绑定失败:', error)
  }
}

/**
 * 解除情侣关系
 */
const unbindCouple = async () => {
  Taro.showModal({
    title: '确认解除',
    content: '确定要解除情侣关系吗？',
    success: async (res) => {
      if (res.confirm) {
        if (!userInfo.value.userId) return

        try {
          const result = await unbindCoupleApi({})

          if (result.success) {
            coupleInfo.value = null
            // 清除store中的绑定信息
            authStore.clearCoupleInfo()
            // 切换回"我的"tab
            showCoupleMemos.value = false
            Taro.showToast({
              title: '解除绑定成功',
              icon: 'success'
            })
          }
        } catch (error) {
          console.error('解除绑定失败:', error)
        }
      }
    }
  })
}

/**
 * 加载备忘录列表
 */
const loadMemos = async () => {
  try {
    let result
    if (showCoupleMemos.value && coupleInfo.value) {
      result = await getMemoList({
        type: 'couple',
        isCompleted: false // 首页只显示未完成的备忘录
      })
    } else {
      result = await getMemoList({
        type: 'personal',
        isCompleted: false // 首页只显示未完成的备忘录
      })
    }

    if (result.success) {
      // 转换时间格式并按计划完成时间升序排序
      memoList.value = result.data.map(item => ({
        ...item,
        completeTime: item.completeTime ? new Date(item.completeTime) : null,
        createTime: item.createdAt ? new Date(item.createdAt).getTime() : new Date().getTime(),
        completeTimeTimestamp: item.completeTime ? new Date(item.completeTime).getTime() : Infinity
      })).sort((a, b) => {
        // 按计划完成时间升序排序，没有设置完成时间的排在最后
        return a.completeTimeTimestamp - b.completeTimeTimestamp
      })
    }
  } catch (error) {
    console.error('加载备忘录失败:', error)
  }
}

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 格式化日期
 */
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY年MM月DD日 HH:mm')
}

/**
 * 选择快捷提醒时间
 */
const selectQuickRemind = (value) => {
  formData.value.remindTime = value
}

/**
 * 打开添加备忘录弹窗
 */
const openAddDialog = () => {
  editingMemo.value = null
  formData.value = {
    title: '',
    content: '',
    completeTime: null,
    remindTime: '',
    type: 'personal'
  }
  showDatePicker.value = false
  showAddDialog.value = true
}

/**
 * 编辑备忘录
 */
const editMemo = (memo) => {
  editingMemo.value = memo
  formData.value = {
    title: memo.title,
    content: memo.content,
    completeTime: memo.completeTime,
    remindTime: memo.remindTime || '',
    type: memo.type || 'personal'
  }
  showDatePicker.value = false
  showAddDialog.value = true
}

/**
 * 打开日期选择器
 */
const openDatePicker = () => {
  showDatePicker.value = true
}

/**
 * 请求订阅通知
 */
const requestSubscribeMessage = async () => {
  try {
    const res = await Taro.requestSubscribeMessage({
      tmplIds: ['7x8ClIU_XGvd8WROzha6QkJTwPcvsGEFD3zQ4OPSA9k'],
      fail: (err) => {
        console.error('请求订阅通知失败:', err)
      }
    })
    return res
  } catch (error) {
    console.error('请求订阅通知失败:', error)
    return null
  }
}

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    formRef.value.validate()
      .then(async ({ valid, errors }) => {
        if (valid) {
          // 如果设置了提醒时间，请求订阅通知
          if (formData.value.remindTime && formData.value.remindTime > 0) {
            await requestSubscribeMessage()
          }
          await saveMemo()
        } else {
          console.log('表单校验错误:', errors)
        }
      })
  } catch (error) {
    console.log('表单校验失败:', error)
  }
}

/**
 * 保存备忘录
 */
const saveMemo = async () => {
  try {
    if (editingMemo.value) {
      const result = await updateMemo({
        id: editingMemo.value._id || editingMemo.value.id,
        title: formData.value.title,
        content: formData.value.content,
        completeTime: formData.value.completeTime,
        remindTime: formData.value.remindTime,
        type: formData.value.type
      })
      console.log(222, formData.value.completeTime)
      if (result.success) {
        await loadMemos()
        showAddDialog.value = false
        // 重置表单数据
        editingMemo.value = null
        formData.value = {
          title: '',
          content: '',
          completeTime: '',
          remindTime: '',
          type: 'personal'
        }
        updateStreak()
        Taro.showToast({
          title: '编辑成功 ✨',
          icon: 'success'
        })
      }
    } else {
      const result = await addMemo({
        title: formData.value.title,
        content: formData.value.content,
        completeTime: formData.value.completeTime,
        remindTime: formData.value.remindTime,
        type: formData.value.type
      })

      if (result.success) {
        await loadMemos()
        showAddDialog.value = false
        // 重置表单数据
        editingMemo.value = null
        formData.value = {
          title: '',
          content: '',
          completeTime: '',
          remindTime: '',
          type: 'personal'
        }
        updateStreak()
        Taro.showToast({
          title: '添加成功 💖',
          icon: 'success'
        })
      }
    }
  } catch (error) {
    console.error('保存备忘录失败:', error)
  }
}

/**
 * 处理取消操作
 */
const handleCancel = () => {
  showAddDialog.value = false
  // 重置表单数据
  setTimeout(() => {
    editingMemo.value = null
    formData.value = {
      title: '',
      content: '',
      completeTime: '',
      type: 'personal'
    }
  }, 300)
}

/**
 * 完成备忘录
 */
const handleComplete = async (memo) => {
  try {
    const result = await completeMemo({
      id: memo._id || memo.id
    })

    if (result.success) {
      await loadMemos()
      Taro.showToast({
        title: '备忘录已标记为完成 ✔️',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('完成备忘录失败:', error)
  }
}

/**
 * 删除备忘录
 */
const deleteMemo = async (id) => {
  Taro.showModal({
    title: '确认删除',
    content: '确定要删除这个备忘录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await deleteMemoApi({
            id: id
          })

          if (result.success) {
            await loadMemos()
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        } catch (error) {
          console.error('删除备忘录失败:', error)
        }
      }
    }
  })
}
</script>
