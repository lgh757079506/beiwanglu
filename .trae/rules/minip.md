# 项目类型：小程序（云开发）

## 项目描述

情侣之间使用的备忘录，有登录、新增（编辑、删除）备忘录、共享备忘录、个人备忘录、绑定/解绑情侣关系等

## 项目框架

Taro（语言框架）、Vue（前端框架）、@nutui/nutui-taro（UI 框架，文档地址：https://nutui.jd.com/taro/vue/4x/#/zh-CN/guide/intro）、微信小程序云开发（数据库、存储、函数等）

## 项目结构

```plaintext
config/              # 项目配置文件（构建配置）
cloudfunctions/      # 云开发函数目录
├── common/           # 公共方法、函数目录
src/
├── assets/           # less、imgs 图片、样式目录
│   ├── less/         # less 样式文件目录
│   └── imgs/         # 图片文件目录
├── components/       # 项目级组件目录
├── pages/            # 页面目录
├── utils/            # 工具函数目录
```

## 代码生成要求及规范

1、所有样式使用 px 实现，不要使用 rpx（除非使用 1 像素边框）
2、样式除了内联方式时全部都是用 scss 格式书写
3、components 中的组件样式不使用 scoped 方式
