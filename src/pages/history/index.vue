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
          class="history-list"
        />
      </view>
    </view>
  </ThemeProvider>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import { getMemoList } from '@/api/memo'
import LoveFloat from '@/components/love-float/index.vue'
import MemoList from '@/components/memo-list/index.vue'
import './index.scss'

// 响应式数据
const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)
const historyList = ref([])

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
    const result = await getMemoList({})

    if (result.success) {
      historyList.value = result.data.map(item => ({
        ...item,
        createTime: item.createdAt ? new Date(item.createdAt).getTime() : new Date().getTime()
      }))
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>