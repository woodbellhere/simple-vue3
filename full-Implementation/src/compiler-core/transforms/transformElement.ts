import { NodeTypes, createVNODECall } from "../ast";

export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // 一起放到createVnodeCall
      // context.helper(CREATE_ELEMENT_VNODE);

      const vnodeTag = `'${node.tag}'`;

      let vnodeProps;

      const children = node.children;
      let vnodeChildren = children[0];
      // const vnodeElement = {
      //   type: NodeTypes.ELEMENT,
      //   tag: vnodeTag,
      //   children: vnodeChildren,
      //   props: vnodeProps,
      // };

      node.codeGenNode = createVNODECall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      );
    };
  }
}
