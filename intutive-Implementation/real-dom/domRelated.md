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
