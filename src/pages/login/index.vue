<template>
  <ThemeProvider>
    <view class="login-container">
      <!-- 背景爱心装饰 -->
      <view class="bg-decoration">
        <view class="heart heart-1">💕</view>
        <view class="heart heart-2">💗</view>
        <view class="heart heart-3">💖</view>
        <view class="heart heart-4">💝</view>
        <view class="heart heart-5">💞</view>
      </view>

      <!-- 主内容区 -->
      <view class="content-wrapper">
        <!-- 标题区域 -->
        <view class="title-section">
          <view class="logo-wrapper">
            <view class="logo-icon">💑</view>
            <view class="logo-ring"></view>
          </view>
          <view class="title-wrapper">
            <text class="title-emoji">💕</text>
            <text class="app-title">情侣备忘录</text>
            <text class="title-emoji">💕</text>
          </view>
          <text class="app-subtitle">记录我们的美好时光</text>
        </view>

        <!-- 登录表单 -->
        <view class="form-card">
          <nut-form
            class="login-form"
            ref="formRef"
            :model-value="formData"
          >
            <!-- 手机号输入 -->
            <nut-form-item
              prop="phone"
              :required="false"
              :rules="[{ required: true, message: '请输入手机号' }, { regex: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
            >
              <view class="input-wrapper">
                <text class="input-icon">📱</text>
                <nut-input
                  v-model="formData.phone"
                  type="tel"
                  placeholder="请输入手机号"
                  class="form-input"
                  input-align="left"
                  :border="false"
                />
              </view>
            </nut-form-item>

            <!-- 密码输入 -->
            <nut-form-item
              prop="password"
              :required="false"
              :rules="[{ required: true, message: '请输入密码' }]"
            >
              <view class="input-wrapper">
                <text class="input-icon">🔒</text>
                <nut-input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="form-input"
                  input-align="left"
                  :border="false"
                >
                  <template #suffix>
                    <view
                      class="password-toggle"
                      @click="showPassword = !showPassword"
                    >
                      <text class="toggle-icon">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</text>
                    </view>
                  </template>
                </nut-input>
              </view>
            </nut-form-item>

            <!-- 登录按钮 -->
            <nut-button
              type="primary"
              :loading="loading"
              class="login-btn"
              @click="handleSubmit"
              block
            >
              <template #default>
                <span
                  v-if="!loading"
                  class="btn-text"
                >✨ 登录 / 注册</span>
                <span
                  v-else
                  class="btn-text"
                >登录中...</span>
              </template>
            </nut-button>
          </nut-form>
        </view>

        <!-- 底部信息 -->
        <view class="bottom-info">
          <text class="version">版本 1.0.0</text>
          <text class="copyright">© 2026 情侣备忘录 💖</text>
        </view>
      </view>
    </view>
  </ThemeProvider>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import './index.scss'

// 响应式数据
const loading = ref(false)
const showPassword = ref(false)
const formData = ref({
  phone: '',
  password: ''
})
const formRef = ref(null)
const authStore = useAuthStore()

/**
 * 页面加载时初始化
 */
onMounted(() => {
})

/**
 * 处理登录提交
 */
const handleSubmit = async () => {
  await formRef.value.reset()
  const valid = await formRef.value.validate()

  if (!valid.valid) {
    return
  }

  loading.value = true

  try {
    await authStore.login(formData.value.phone, formData.value.password)

    Taro.switchTab({
      url: '/pages/index/index'
    })
  } catch (err) {
    console.error('登录失败:', err)
    Taro.showToast({
      title: err.message || '登录失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>
