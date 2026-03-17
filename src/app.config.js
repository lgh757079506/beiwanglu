export default {
  pages: [
    "pages/mine/index",
    "pages/login/index",
    "pages/index/index",
    "pages/history/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "情侣备忘录",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    list: [
      {
        pagePath: "pages/index/index",
        text: "备忘录",
        iconPath: "./assets/imgs/memo.png",
        selectedIconPath: "./assets/imgs/memo.png",
      },
      {
        pagePath: "pages/history/index",
        text: "历史记录",
        iconPath: "./assets/imgs/history.png",
        selectedIconPath: "./assets/imgs/history.png",
      },
      {
        pagePath: "pages/mine/index",
        text: "我的",
        iconPath: "./assets/imgs/mine.png",
        selectedIconPath: "./assets/imgs/mine.png",
      },
    ],
    color: "#ff6b9d",
    selectedColor: "#c44569",
    backgroundColor: "#fff",
  },
};
