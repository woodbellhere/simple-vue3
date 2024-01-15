import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  // 遍历
  traverseNode(root, context);
  // 修改text content
  createRootCodeGen(root);

  root.helpers = [...context.helpers.keys()];
}

function createRootCodeGen(root) {
  // root.codeGenNode = root.children[0];
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codeGenNode = child.codeGenNode;
  } else {
    root.codeGenNode = root.children[0];
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
  };
  return context;
}

function traverseNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms;
  // 插件要能实现先调用后执行，后调用先执行
  const exitFns: any = [];
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    const onExit = transform(node, context);
    if (onExit) exitFns.push(onExit);
  }
  // helper函数从generate放到transform
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      // context.helper("toDisplayString");
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context);
      break;
    default:
      break;
  }
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
    // 执行完后，再执行下一个
  }

  // traverseChildren(node, context);
}

function traverseChildren(node: any, context: any) {
  const children = node.children;
  // if (children) { 这个放到traverseNode的switch了
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traverseNode(node, context);
  }
}
