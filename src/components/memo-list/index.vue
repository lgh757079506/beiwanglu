<template>
  <view
    class="memo-list-container"
    :style="{ height: height }"
  >
    <view class="memo-list-scroll">
      <view
        v-for="(group, date) in groupedMemos"
        :key="date"
        class="memo-group"
      >
        <!-- 日期标题 -->
        <view
          v-if="showDate"
          class="date-header"
        >
          <text class="date-text">{{ formatDate(date) }}</text>
        </view>

        <!-- 备忘录列表 -->
        <view class="memo-items">
          <view
            v-for="(memo, index) in group"
            :key="memo.id || memo._id"
            class="memo-item"
            :class="{
              'memo-item-couple': memo.userId !== currentUserId
            }"
            @click="handleMemoClick(memo)"
          >
            <!-- 内容区域 -->
            <view class="content-column">
              <!-- 标题和内容 -->
              <view class="content-body">
                <text class="memo-title">{{ memo.title }}</text>
                <text class="memo-content">{{ memo.content }}</text>
              </view>

              <!-- 操作按钮 -->
              <view
                v-if="showActions"
                class="action-buttons"
              >
                <view
                  class="action-btn complete"
                  @click="handleComplete(memo)"
                  title="完成"
                >
                  <image
                    class="btn-icon"
                    src="@/assets/imgs/complete.png"
                    mode="aspectFit"
                  />
                  <text class="btn-text">完成</text>
                </view>
                <view
                  class="action-btn edit"
                  @click="handleEdit(memo)"
                  title="编辑"
                >
                  <image
                    class="btn-icon"
                    src="@/assets/imgs/edit.png"
                    mode="aspectFit"
                  />
                  <text class="btn-text">编辑</text>
                </view>
                <view
                  class="action-btn delete"
                  @click="handleDelete(memo.id || memo._id)"
                  title="删除"
                >
                  <image
                    class="btn-icon"
                    src="@/assets/imgs/delete.png"
                    mode="aspectFit"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view
        v-if="memos.length === 0"
        class="empty-state"
      >
        <text class="empty-icon">💌</text>
        <text class="empty-text">{{ emptyText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'

// Props
const props = defineProps({
  memos: {
    type: Array,
    default: () => []
  },
  showDate: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  emptyText: {
    type: String,
    default: '还没有备忘录，点击添加按钮创建'
  },
  currentUserId: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '100%'
  }
})

// Emits
const emit = defineEmits([
  'edit',
  'complete',
  'delete',
  'memo-click'
])

// 处理备忘录点击
const handleMemoClick = (memo) => {
  emit('memo-click', memo)
}

// 处理编辑
const handleEdit = (memo) => {
  emit('edit', memo)
}

// 处理完成
const handleComplete = (memo) => {
  emit('complete', memo)
}

// 处理删除
const handleDelete = (id) => {
  emit('delete', id)
}

// 按日期分组
const groupedMemos = computed(() => {
  const groups = {}

  props.memos.forEach(memo => {
    const date = dayjs(memo.createTime || memo.createdAt).format('YYYY-MM-DD')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(memo)
  })

  // 按日期降序排序
  const sortedGroups = {}
  Object.keys(groups).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()).forEach(date => {
    sortedGroups[date] = groups[date]
  })
  return sortedGroups
})

// 格式化日期
const formatDate = (dateStr) => {
  return dayjs(dateStr).format('YYYY-MM-DD')
}

// 格式化时间
const formatTime = (timestamp) => {
  return dayjs(timestamp).format('HH:mm:ss')
}
</script>

<style lang="scss">
@import '@/assets/css/global.scss';

.memo-list-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  background: transparent;

  .memo-list-scroll {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 10px 0;
    box-sizing: border-box;

    .memo-group {
      &:not(:first-child) {
        margin-top: 24px;
      }

      .date-header {
        padding: 8px 20px;
        margin-bottom: 16px;
        background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
        border-radius: $border-radius-lg;
        box-shadow: 0 4px 16px rgba(255, 107, 157, 0.3);
        display: inline-block;

        .date-text {
          font-size: 15px;
          color: white;
          font-weight: 600;
        }
      }

      .memo-items {
        display: flex;
        flex-direction: column;
        gap: 14px;

        .memo-item {
          background: $background-card;
          border-radius: $border-radius-xl;
          padding: 20px;
          box-shadow: $shadow-md;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 157, 192, 0.3);
          transition: all $transition-normal;
          position: relative;
          overflow: hidden;

          &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, $primary-color, $primary-dark, $primary-color);
            background-size: 200% 100%;
            animation: shimmer 3s ease-in-out infinite;
          }

          &:active {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255, 107, 157, 0.35);
          }

          &.memo-item-couple {
            border-left: 4px solid $primary-color;
          }

          .content-column {
            width: 100%;

            .content-body {
              margin-bottom: 18px;

              .memo-title {
                font-size: 18px;
                font-weight: 600;
                color: $text-primary;
                margin-bottom: 10px;
                display: block;
                line-height: 26px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }

              .memo-content {
                font-size: 14px;
                font-weight: normal;
                color: $text-secondary;
                line-height: 22px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
              }
            }

            .action-buttons {
              display: flex;
              gap: 10px;
              align-items: center;

              .action-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 16px;
                border-radius: $border-radius-md;
                transition: all $transition-normal;
                border: 1rpx solid transparent;
                font-weight: 500;

                &:active {
                  transform: scale(0.95);
                }

                &.complete {
                  flex: 2;
                  flex-shrink: 0;
                  background: rgba(72, 187, 120, 0.12);
                  color: $success-color;
                  border-color: rgba(72, 187, 120, 0.3);

                  &:active {
                    background: rgba(72, 187, 120, 0.2);
                  }
                }

                &.edit {
                  flex: 2;
                  flex-shrink: 0;
                  background: rgba(255, 107, 157, 0.12);
                  color: $primary-color;
                  border-color: rgba(255, 107, 157, 0.3);

                  &:active {
                    background: rgba(255, 107, 157, 0.2);
                  }
                }

                &.delete {
                  border-radius: $border-radius-md;
                  padding: 10px 14px;
                  background: rgba(245, 101, 101, 0.12);
                  color: $danger-color;
                  border-color: rgba(245, 101, 101, 0.3);

                  &:active {
                    background: rgba(245, 101, 101, 0.2);
                  }
                }

                .btn-icon {
                  width: 18px;
                  height: 18px;
                  margin-right: 6px;
                }

                .btn-text {
                  font-size: 14px;
                  font-weight: 500;
                }

                &.delete .btn-icon {
                  margin-right: 0;
                }
              }
            }
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 80px 40px;
      background: $background-card;
      border-radius: $border-radius-xl;
      box-shadow: $shadow-md;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 157, 192, 0.3);
      text-align: center;

      .empty-icon {
        font-size: 64px;
        margin-bottom: 24px;
        animation: float 3s ease-in-out infinite;
      }

      .empty-text {
        font-size: 16px;
        color: $text-muted;
        line-height: 26px;
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}
</style>