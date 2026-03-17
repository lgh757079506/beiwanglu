<template>
    <nut-config-provider :theme-vars="themeVars">
        <slot></slot>
    </nut-config-provider>
</template>
<script setup>
import Taro from '@tarojs/taro';
import { ref, onMounted } from 'vue'

const defineProps = defineProps({
    fullPage: {
        type: Boolean,
        default: true
    }
})

const themeVars = ref({
    primaryColor: '#ff6b9d',
    // 弹窗样式
    dialogBorderRadius: '24px',
    dialogHeaderHeight: '60px',
    dialogHeaderFontSize: '18px',
    dialogHeaderFontWeight: '700',
    dialogContentPadding: '20px',
    dialogFooterHeight: '56px',
    // 按钮样式
    buttonPrimaryColor: '#ffffff',
    buttonPrimaryBorderColor: 'transparent',
    buttonPrimaryBackgroundColor: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
    buttonBorderRadius: '12px',
    buttonHeight: '44px',
    buttonFontSize: '15px',
    // 输入框样式
    inputBorderColor: 'rgba(255, 157, 192, 0.4)',
    inputBackgroundColor: '#ffffff',
    inputBorderRadius: '12px',
    // 日期选择器样式
    pickerBorderColor: 'rgba(255, 157, 192, 0.4)',
    pickerBackgroundColor: '#ffffff',
    pickerBorderRadius: '12px',
    // 单选框样式
    radioPrimaryColor: '#ff6b9d',
    // 标签样式
    tagPrimaryColor: '#ffffff',
    tagPrimaryBackgroundColor: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
    tagBorderRadius: '20px',
    // 单元格样式
    cellBorderRadius: '12px',
    cellBackgroundColor: '#ffffff',
    // 弹窗背景
    popupBorderRadius: '24px 24px 0 0',
})

const navigatorBarHeight = ref(0)
</script>
<style lang="scss">
.nut-theme- {
    height: 100%;
}
</style>
