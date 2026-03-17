<template>
  <ThemeProvider>
    <view class="mine-container">
      <!-- 背景装饰 -->
      <view class="bg-decoration">
        <view class="heart heart-1">💕</view>
        <view class="heart heart-2">💗</view>
        <view class="heart heart-3">💖</view>
        <view class="heart heart-4">💝</view>
      </view>

      <!-- 顶部标题 -->
      <view class="header">
        <view class="title-wrapper">
          <text class="title-emoji">💑</text>
          <text class="title">我的</text>
          <text class="title-emoji">💑</text>
        </view>
      </view>

      <!-- 顶部用户信息区域 -->
      <view class="user-section">
        <view class="user-card">
          <view class="avatar-container">
            <image
              v-if="userInfo.avatar"
              :src="userInfo.avatar"
              class="avatar"
            />
            <view
              v-else
              class="avatar-placeholder"
            >
              <text class="avatar-emoji">😊</text>
            </view>
            <view class="avatar-ring"></view>
          </view>
          <view class="user-info">
            <text class="user-phone">{{ userInfo.phone || '未登录' }}</text>
            <text class="user-id">用户ID：{{ userInfo.uniqueId || '---' }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <nut-button
          v-if="!isLogin"
          type="primary"
          @click="handleLogin"
          class="action-btn"
        >
          <span class="btn-text">💕 登录</span>
        </nut-button>
        <nut-button
          v-else
          type="danger"
          @click="handleLogout"
          class="action-btn danger"
        >
          <span class="btn-text">👋 退出登录</span>
        </nut-button>
      </view>

      <!-- 功能列表 -->
      <view class="feature-section">
        <view class="feature-card">
          <nut-cell
            title="个人信息"
            is-link
            @click="handlePersonalInfo"
            class="feature-cell"
          >
            <template #icon>
              <view class="cell-icon">👤</view>
            </template>
          </nut-cell>
          <nut-cell
            title="关于我们"
            is-link
            @click="handleAbout"
            class="feature-cell"
          >
            <template #icon>
              <view class="cell-icon">💕</view>
            </template>
          </nut-cell>
          <nut-cell
            title="设置"
            is-link
            @click="handleSettings"
            class="feature-cell"
          >
            <template #icon>
              <view class="cell-icon">⚙️</view>
            </template>
          </nut-cell>
        </view>
      </view>
    </view>
  </ThemeProvider>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Taro from '@tarojs/taro'
import { IconFont } from '@nutui/icons-vue-taro'
import { useAuthStore } from '@/store/auth'
import LoveFloat from '@/components/love-float/index.vue'
import './index.scss'

// 响应式数据
const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)
const isLogin = computed(() => authStore.isLogin)

/**
 * 页面加载时检查登录状态
 */
onMounted(() => {
  // 从store中获取登录状态，不需要从storage中获取
  authStore.initAuth()
})

/**
 * 处理登录
 */
const handleLogin = () => {
  Taro.navigateTo({
    url: '/pages/login/index'
  })
}

/**
 * 处理退出登录
 */
const handleLogout = () => {
  Taro.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await authStore.logout()
        Taro.showToast({
          title: '退出成功',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 处理个人信息
 */
const handlePersonalInfo = () => {
  if (!isLogin.value) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  Taro.showToast({
    title: '个人信息功能开发中',
    icon: 'none'
  })
}

/**
 * 处理关于我们
 */
const handleAbout = () => {
  Taro.showModal({
    title: '关于我们',
    content: '情侣备忘录是一款专为情侣设计的备忘录应用，让爱情更有温度。\n\n版本：1.0.0',
    showCancel: false
  })
}

/**
 * 处理设置
 */
const handleSettings = () => {
  Taro.showToast({
    title: '设置功能开发中',
    icon: 'none'
  })
}
</script>