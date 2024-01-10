# vue 三大核心系统

## 简述

- compiler 编译器 模板编译
  - 模板到 render 函数
- runtime render 模块 渲染器
  - vnode 到浏览器展示
- reactivity 响应式

  - 实时更新 vnode

## vue 的工作流程

- 假设一个有 template 部分有响应式数据的简单组件
- 渲染器 将 template 转换为 render 函数
- 响应式系统将其中的响应式数据初始化
- 进入渲染阶段，render 函数参考响应式数据并触发
- render 函数返回 Vdom
- 进入 mount 阶段，mount Vdom 到页面，形成真实 DOM
- 如果响应式数据有任何更新，则进入 patch 阶段，新旧数据一起发送到 patch 函数，对比后更新页面

## 系统详解

- 渲染器

  - render 阶段 h 函数，返回一个 vnode 对象
  - mount 阶段 mount 函数，将 vnode 挂载到 dom 上
  - patch 阶段 patch 算法，将两个 vnode 对比以决定新的 vnode

- 响应式

  - 基本思路就是 dep 文件中收集和通知功能的一个 set,这个 dep 和 ref 功能很像
  - 扩展思路就是 reactive 文件中 上述 set 作为 depsMap 中特定 key 的值；depsMap 本身又作为 targetMap 中特定 targetObject 的值
  - 这样一路下来，对象 -》 属性 -》 依赖函数/对象就齐活了

  - defineProperty 在处理新增属性时需要重复调用，proxy 不用
  - defineProperty 可以直接处理对象的修改，但 proxy 必须修改自己实例代理对象
  - defineProperty 能够观察捕获的类型不如 proxy 多，比如 has in 这类操作，deleteproperty 这些
  - weakMap 没法遍历 key，只能用 object，可以垃圾回收；map 可以随意用 key，可以遍历，不能垃圾回收

- 编译器
  - 一个前提，对象生成的 vdom 一般层次很深，规模很大。虽然 js 引擎处理这些结构很快，但是框架有办法让它更快
  - 静态提升 hoistStatic 会将没有响应式的节点或属性提升/声明到 render 函数之外，这阿姨那个我们就可以直接跳过这些节点（使用时也直接读取现成变量），专注于特定节点的更新
  - 而 patchFlag 就是说，对于很多节点的属性都会在前面加一个能被特殊解析的注释格式 /_PROPS_/ xxx，这样 xxx 就会被标记为需要更新，会被编译器特别关照
  - 也基于 patchFlag，我们在编译阶段其实能把模板整体分为“需要变动的部分”和“不需要变动的部分”，而需要变动的部分就会被放入 dynamicChildren 这个单独类别中，diff 算法省略其他部分，只对这些数据进行更新
  - 从编译器具体实现中也可以看到，基本上都引入了 cache 机制，监听回调的事件一经生成就会被存到 render 函数的 cache 变量中，后面所有节点都会使用同一个缓存（如果是同一个回调事件的话）
