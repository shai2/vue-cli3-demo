import storage from 'good-storage'

// 设置app头部
export function setTitle (title) {
  yimiNative.isHomePage && yimiNative.isHomePage(title)
}

// app返回上一页
export function goBack () {
  yimiNative.h5GoBack && yimiNative.h5GoBack()
}