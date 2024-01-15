# compiler

## 整体的编译流程

- 头尾就是模板编译为渲染函数
- 具体过程如下
- 模板
- 通过 parse 实现词法分析和语法分析以及语义分析转为模板 ast
  - 仍然有 root 节点
  - 不同标签的 type
  - 标签子节点存在 children
  - 标签属性和指令节点存在 props
  - 不同 type 的节点存的 props 名字也不同。比如 type 为 directive 的指令有 name 属性
- 经过 transform 变为 js 的 ast
  - v-if 和 v-else 是否配套？
  - 属性值是静态还是动态的？
  - 插槽是不是有父组件的数据？
- 最终通过代码生成变为渲染函数

```javascript
const templateAST = parse(template);
const jsAST = transform(templateAST);
const code = generate(jsAST);
```

## 一点核心工作

- 实现插值语法
  - 大体流程是 baseParser -> createRoot -> parseChildren -> parseInterpolation -> 把值从双括号里取出来- 也是非常朴实无华地手动截取字符串
- 实现 element 解析
- 实现 text 解析
