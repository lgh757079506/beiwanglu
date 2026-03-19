<template>
  <ThemeProvider>
    <view class="history-container">
      <!-- 背景装饰 -->
      <view class="bg-decoration">
        <view class="heart heart-1">💕</view>
        <view class="heart heart-2">💗</view>
        <view class="heart heart-3">💖</view>
        <view class="heart heart-4">💝</view>
        <view class="heart heart-5">💞</view>
      </view>

      <!-- 顶部标题 -->
      <view class="header">
        <view class="title-wrapper">
          <text class="title-emoji">📜</text>
          <text class="title">历史记录</text>
          <text class="title-emoji">📜</text>
        </view>
        <view class="subtitle">回忆我们的美好时光</view>
      </view>

      <!-- 历史备忘录列表 -->
      <view class="list-wrapper">
        <MemoList
          :memos="historyList"
          :show-date="true"
          :show-actions="false"
          :current-user-id="userInfo.userId"
          :empty-text="'暂无历史记录'"
          sort="down"
          timeTitle="实际完成时间"
          @memo-click="handleMemoClick"
          class="history-list"
        />
      </view>

      <!-- 备忘录详情弹窗 -->
      <nut-dialog
        v-model:visible="showDetailDialog"
        :title="selectedMemo?.title || '备忘录详情'"
        width="90%"
        :close-on-click-overlay="true"
        class="detail-dialog"
      >
        <view class="detail-content">
          <!-- 头部装饰 -->
          <view class="detail-header">
            <view class="emoji-icon">{{ selectedMemo?.type === 'couple' ? '❤️' : '📝' }}</view>
            <text class="couple-tag">{{ selectedMemo?.type === 'couple' ? '我们的美好回忆' : '我的个人记忆' }}</text>
          </view>

          <!-- 内容区域 -->
          <view class="detail-body">
            <view class="content-section">
              <text class="section-title">内容</text>
              <view class="content-card">
                <text class="content-text">{{ selectedMemo?.content }}</text>
              </view>
            </view>

            <!-- 时间信息 -->
            <view class="time-section">
              <view class="time-item">
                <view class="time-icon">⏰</view>
                <view class="time-info">
                  <text class="time-label">创建时间</text>
                  <text class="time-value">{{ selectedMemo ? formatTime(selectedMemo.createTime) : '' }}</text>
                </view>
              </view>
              <view class="time-item">
                <view class="time-icon">✅</view>
                <view class="time-info">
                  <text class="time-label">完成时间</text>
                  <text class="time-value">{{ selectedMemo?.completedAt ?
                    formatTime(dayjs(selectedMemo.completedAt).valueOf()) : '' }}</text>
                </view>
              </view>
            </view>

            <!-- 类型信息 -->
            <view class="type-section">
              <text class="type-label">类型</text>
              <text
                class="type-badge"
                :class="{ couple: selectedMemo?.type === 'couple' }"
              >{{ selectedMemo?.type === 'personal' ? '个人备忘录' : '情侣备忘录' }}</text>
            </view>
          </view>
        </view>
        <template #footer>
          <nut-button
            type="primary"
            @click="showDetailDialog = false"
            class="dialog-btn"
            block
          >关闭</nut-button>
        </template>
      </nut-dialog>
    </view>
  </ThemeProvider>
</template>

<script setup>
import dayjs from 'dayjs'
import { ref, onMounted, computed } from 'vue'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import { getMemoList } from '@/api/memo'
import LoveFloat from '@/components/love-float/index.vue'
import MemoList from '@/components/memo-list/index.vue'
import './index.scss'

// 响应式数据
const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo || {})
const historyList = ref([])
const showDetailDialog = ref(false)
const selectedMemo = ref(null)

/**
 * 下拉刷新处理
 */
const onPullDownRefresh = async () => {
  try {
    await loadHistory()
  } finally {
    Taro.stopPullDownRefresh()
  }
}
usePullDownRefresh(onPullDownRefresh)

/**
 * 页面加载时加载历史记录
 */
onMounted(async () => {
  // 从store中获取登录状态
  authStore.initAuth()
  await loadHistory()
})

// 暴露下拉刷新方法
defineExpose({
  onPullDownRefresh
})

/**
 * 加载历史记录
 */
const loadHistory = async () => {
  try {
    // 获取已完成的备忘录
    const result = await getMemoList({
      isCompleted: true
    })

    if (result.success) {
      // 转换时间格式并按真实完成时间降序排序
      historyList.value = result.data.map(item => ({
        ...item,
        createTime: item.createdAt ? dayjs(item.createdAt).valueOf() : dayjs().valueOf(),
        completedAtTimestamp: item.completedAt ? dayjs(item.completedAt).valueOf() : dayjs().valueOf()
      })).sort((a, b) => {
        // 按真实完成时间降序排序
        return b.completedAtTimestamp - a.completedAtTimestamp
      })
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

/**
 * 处理备忘录点击事件，显示详情
 */
const handleMemoClick = (memo) => {
  selectedMemo.value = memo
  showDetailDialog.value = true
}

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss">
.detail-dialog {
  --nut-dialog-content-padding: 0;
}

.detail-content {
  padding: 20px 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #f0f0f0;
}

.emoji-icon {
  font-size: 28px;
  margin-right: 12px;
  line-height: 1;
}

.couple-tag {
  background-color: rgba(255, 107, 157, 0.1);
  color: #ff6b9d;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 16px;
}

.detail-body {
  color: #333;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: block;
  color: #1a1a1a;
}

.content-section {
  margin-bottom: 24px;
}

.content-card {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 12px;
  min-height: 100px;
  display: flex;
  align-items: center;
}

.content-text {
  font-size: 16px;
  line-height: 1.6;
  color: #4a4a4a;
}

.time-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.time-item {
  flex: 1;
  min-width: 150px;
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.time-icon {
  font-size: 20px;
  margin-right: 12px;
  color: #ff6b9d;
}

.time-label {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
  display: block;
}

.time-value {
  font-size: 15px;
  font-weight: 500;
}

.type-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-label {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.type-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.type-badge:not(.couple) {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.type-badge.couple {
  background-color: rgba(255, 107, 157, 0.1);
  color: #ff6b9d;
}

.dialog-btn {
  margin-top: 16px;
}
</style>