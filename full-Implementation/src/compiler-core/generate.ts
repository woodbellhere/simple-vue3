import { isString } from "../shared";
import { NodeTypes } from "./ast";
import {
  TO_DISPLAY_STRING,
  helperMapName,
  CREATE_ELEMENT_VNODE,
} from "./runtimeHelpers";

export function generate(ast) {
  const context = createCodeGenContext();
  const { push } = context;

  // 下面的全抽成一个函数
  // let code = "";
  // const VueBinging = "Vue";
  // const aliasHelper = (s) => `${s}: _${s}`;
  // helper存方法的逻辑应该放到transform
  // const helpers = ["toDisplayString"];
  // push(`const { toDisplayString: _toDisplayString } = Vue`);

  // push(`const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`);
  // push("\n");
  // push("return ");
  // code += "return ";
  genFunctionPreamble(ast, context);

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  // const node = ast.children[0];
  // 这两段抽出来
  // const node = ast.codeGenNode;
  // code += `return '${node.content}'`;

  // code += `function ${functionName}(${signature}){`;
  // code += genNode(ast, code);
  // code += "}";
  push(`function ${functionName}(${signature}){`);
  push("return ");
  genNode(ast.codeGenNode, context);
  push("}");

  return {
    code: context.code,
  };
}

function createCodeGenContext() {
  const context = {
    code: "",
    push(code) {
      context.code += code;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
    newline() {
      context.code += "\n";
    },
  };
  return context;
}

// 考虑到模板可能有模块背景？有这么一些背景性的先导代码
function genFunctionPreamble(ast, context) {
  const { push, newline } = context;
  const VueBinging = "Vue";
  // const aliasHelper = (s) => `${s}: _${s}`;
  const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`
    );
  }
  push("\n");
  // newline();
  push("return ");
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      // const node = node.codeGenNode;
      // context += `return '${node.content}'`;
      // 再抽出来重构
      // const { push } = context;
      // push(`'${node.content}'`);
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    case NodeTypes.TEXT:
      genText(node, context);
      break;

    default:
      break;
  }
}

function genText(node, context) {
  const { push } = context;
  push(`'${node.content}'`);
}

function genInterpolation(node, context) {
  const { push, helper } = context;
  // push("_toDisplayString(");
  // push(`_${helperMapName[TO_DISPLAY_STRING]}(`);
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

function genExpression(node, context) {
  const { push } = context;
  push(`${node.content}`);
}

function genElement(node, context) {
  const { push, helper } = context;
  const { tag, children, props } = node;
  // push(`${helper(CREATE_ELEMENT_VNODE)}("${tag}"), ${props}, `);
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);

  // for (let i = 0; i < children.length; i++) {
  //   const child = children[i];
  //   genNode(child, context);
  // }
  // genNode(children, context);
  genNodeList(genNullable([tag, props, children]), context);
  push(")");
}

// genNode只能接收单个参数
function genNodeList(nodes, context) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }
    // 从snap快照看，缺一个逗号
    if (i < nodes.length - 1) {
      push(", ");
    }
  }
}

function genNullable(args) {
  return args.map((arg) => arg || "null");
}

function genCompoundExpression(node, context) {
  const { push } = context;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}
