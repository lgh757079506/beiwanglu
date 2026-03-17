<template>
  <view
    class="love-float-container"
    :style="{ height: topHeight + 'px' }"
  >
    <!-- 爱心模式 -->
    <view
      v-if="mode === 'love'"
      class="love-content"
    >
      <view
        v-for="(love, index) in loveList"
        :key="love.id"
        class="love-item"
        :style="{
          left: love.left + 'px',
          top: love.top + 'px',
          '--scale': love.scale,
          '--rotate': love.rotate + 'deg',
          animation: `sparkle ${love.duration}s ease-in-out infinite`
        }"
      >
        <text class="love-symbol">❤</text>
      </view>
    </view>

    <!-- 标题模式 -->
    <view
      v-else-if="mode === 'title'"
      class="title-content"
    >
      <text class="page-title">{{ title }}</text>
    </view>

    <!-- 空模式 -->
    <view
      v-else-if="mode === 'empty'"
      class="empty-content"
    >
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'

export default {
  name: 'LoveFloat',
  props: {
    mode: {
      type: String,
      default: 'love', // love: 爱心模式, title: 标题模式, empty: 空模式
      validator: (value) => ['love', 'title', 'empty'].includes(value)
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loveList: [],
      topHeight: 0,
      loveCount: 30
    }
  },
  methods: {
    /**
     * 生成随机数
     */
    random(min, max) {
      return Math.random() * (max - min) + min
    },

    /**
     * 生成唯一ID
     */
    generateId() {
      return Date.now() + Math.random().toString(36).substr(2, 9)
    },

    /**
     * 初始化爱心列表
     */
    initLoveList() {
      if (this.mode !== 'love') return

      // 清空现有爱心
      this.loveList = []

      // 生成30个爱心
      for (let i = 0; i < this.loveCount; i++) {
        this.createLove()
      }
    },

    /**
     * 创建新的爱心
     */
    createLove() {
      const windowWidth = Taro.getWindowInfo().windowWidth
      const newLove = {
        id: this.generateId(),
        left: this.random(20, windowWidth - 40), // 确保爱心在屏幕内
        top: this.random(10, this.topHeight - 30), // 只在顶部区域内生成
        duration: this.random(3, 8),
        opacity: this.random(0.3, 0.8),
        scale: this.random(0.5, 1.2),
        rotate: this.random(0, 360)
      }

      this.loveList.push(newLove)
    },

    /**
     * 获取顶部高度（使用Taro.getCustomNavigatorBarHeight）
     */
    getCustomNavigatorBarHeight() {
      const info = Taro.getWindowInfo();
      const customBar = Taro.getMenuButtonBoundingClientRect(); //菜单按钮

      this.topHeight = (customBar.bottom + customBar.top - info.statusBarHeight) || 0; //计算得到定义的状态栏高度

    }
  },
  mounted() {
    this.getCustomNavigatorBarHeight()
    this.initLoveList()
  },
  expose: ['topHeight', 'getCustomNavigatorBarHeight']
}
</script>

<style lang="scss">
@import '@/assets/css/global.scss';

.love-float-container {
  pointer-events: none;
  overflow: hidden;
  background: transparent;
}

.love-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.love-item {
  position: absolute;
}

.love-symbol {
  font-size: 20px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 8px rgba(255, 107, 157, 0.4);
  transform: perspective(100px) rotateX(30deg) rotateY(10deg);
  display: block;
}

.title-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 $spacing-md;
  box-sizing: border-box;
  background: linear-gradient(135deg, #fff5f7 0%, #ffe8ec 100%);
  border-bottom: 2px solid rgba(255, 107, 157, 0.1);
}

.page-title {
  font-size: $font-size-xl;
  font-weight: 600;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  text-shadow: 0 2px 4px rgba(255, 107, 157, 0.2);
}

.empty-content {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fff5f7 0%, #ffe8ec 100%);
  border-bottom: 2px solid rgba(255, 107, 157, 0.1);
}

@keyframes sparkle {
  0% {
    transform: scale(var(--scale)) rotate(var(--rotate)) perspective(100px) rotateX(30deg) rotateY(10deg);
    opacity: 0;
    filter: brightness(1) drop-shadow(0 0 5px rgba(255, 107, 157, 0.5));
  }

  50% {
    transform: scale(calc(var(--scale) * 1.2)) rotate(calc(var(--rotate) + 180deg)) perspective(100px) rotateX(30deg) rotateY(10deg);
    opacity: 0.9;
    filter: brightness(1.5) drop-shadow(0 0 15px rgba(255, 107, 157, 0.8));
  }

  100% {
    transform: scale(var(--scale)) rotate(calc(var(--rotate) + 360deg)) perspective(100px) rotateX(30deg) rotateY(10deg);
    opacity: 0;
    filter: brightness(1) drop-shadow(0 0 5px rgba(255, 107, 157, 0.5));
  }
}
</style>