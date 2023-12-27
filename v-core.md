真实 dom 渲染

- html 元素直接形成 dom 树
- 浏览器据此进行渲染

虚拟 dom 渲染

- 用 js 对象包裹的 vnode 在被 js 操作，应用算法上更方便
- js 跨平台更方便，到 canvas，webgl，ssr 乃至原生上都省事一些
- 具体过程
  - template 中的代码
  - 经过 render 配置项的各种函数
  - 形成虚拟节点 vnode
  - 渲染为真实 dom
  - 展示到浏览器上

vue 有三大核心系统

- compiler 编译器 模板编译
  - 模板到 render 函数
- runtime render 模块 渲染器
  - vnode 到浏览器展示
- reactivity 响应式
  - 实时更新 vnode

mini-vue

- 渲染器

  - h 函数，返回一个 vnode 对象
  - mount 函数，将 vnode 挂载到 dom 上
  - patch 函数，将两个 vnode 对比以决定新的 vnode

- 响应式
  - defineProperty 在处理新增属性时需要重复调用，proxy 不用
  - defineProperty 可以直接处理对象的修改，但 proxy 必须修改自己实例代理对象
  - defineProperty 能够观察捕获的类型不如 proxy 多，比如 has in 这类操作，deleteproperty 这些
