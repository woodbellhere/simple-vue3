# vue 的简单尝试

## 动机

- 一个是感觉面试题里问源码的变多了。虽然性质上更多是筛选，但不得不说因为确实出题角度很刁钻，作为筛选也确实很有用。
- 另一个是自己偶然看过几篇零散的源码解析以后确实感觉也挺有长进，比如说
  - mount 其实是直接变更挂载元素的 innerHTML
  - 选项式 API 中 script 中声明的内容确实会自动绑定 publicThis，然后这个 publicThis 其实就是组件 instance，所以可以 this 取相关数据
  - template 模板其实最后全部转为 h 函数进行渲染，然后这个所谓渲染函数，其实看代码或者说看思路还是内部调用 document.createElement
  - 创建 vnode 的 h 函数某种程度上作用异常直接，基本就是用对象包一层返回
  - 响应式系统的数据结构用的真的很奇妙

## 内容

按霍春阳《Vue 设计与实现》的说法，vue 大致可以分为响应式，渲染器，编译器，组件系统和算额外功能的服务端渲染

- 响应式主要就是我们看到的数据和依赖联动更新
- 编译器就是让这些浏览器本身也不认识的 vue 代码转换成普通的 js 和 html 代码，或者说模板变成 render 函数
- 渲染器就是让这些代码变成实际或虚拟的 dom 让浏览器渲染出来

## 目前

- 响应式有一个简单实现，大概对应书上第 4 章
- 渲染器也有一个创建挂载过程的简单实现，也大概对应书上第 8 章
- 编译器目前没啥特别大的紧张，不过了解了浏览器本身大概怎么解析 html 的

## 计划

- 先乖乖把响应式写一遍再说，不然读源码脑子里没大概思路太痛苦了
