import { ElementTypes, NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}

function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT,
  };
}

// 后面的parse都从这里开始被调用
function parseChildren(context, ancestors) {
  const nodes: any = [];
  // 状态机要循环处理字符,while就相当于回到初始状态
  // 换句话说，所有的parsexxx都要在else-if中调用完
  while (!isEnd(context, ancestors)) {
    let node;
    const source = context.source;
    // 如果读到大括号，开始解析插值
    if (source.startsWith("{{")) {
      node = parseInterpolation(context);
      // 如果读到元素的尖括号，开始解析元素
    } else if (source[0] === "<") {
      if (/[a-z]/i.test(source[1])) {
        node = parseElement(context, ancestors);
      }
    }
    // 没有if的默认情况下就按文本节点解析
    if (!node) node = parseText(context);
    // 这个进栈操作才算收尾
    nodes.push(node);
  }
  return nodes;
}

// 专门用于控制解析器的循环停止
// 报错也在这里触发
function isEnd(context: any, ancestors) {
  // 遇到<结束标签就结束
  const source = context.source;
  // if (parentTag && source.startsWith(`</${parentTag}>`)) {
  if (source.startsWith(`</`)) {
    // 从栈顶往下循环更好
    // for (let i = 0; i < ancestors.length; i++) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      // if (source.slice(2, 2 + tag.length) === tag) return true;
      if (startsWithEndTagOpen(source, tag)) {
        return true;
      }
    }
  }
  // 如果source有值就返回
  return !source;
}

function parseInterpolation(context) {
  // 朴实无华地slice拿出大括号中的内容，但还是感觉做麻烦了
  // 前后大括号的索引,搜索并更新忽略前面括号
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );
  // context.source = context.source.slice(openDelimiter.length); 封装成下面这个
  advanceBy(context, openDelimiter.length);
  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = context.source.slice(0, rawContentLength);
  // 也可以用parseText的封装操作;
  const preTrimContent = parseTextData(context, rawContent.length);
  const content = preTrimContent.trim();
  //读取括号中内容后删除准备读后面的
  advanceBy(context, closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

// 与解析插值相互区分
function parseElement(context: any, ancestors) {
  // 内部解析抽离到parsetag中
  // 调用两次分别解决开始和结束标签
  const element = parseTag(context, TagType.Start);
  // 状态机里的那个栈
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  // if (context.source.slice(2, 2 + element.tag.length) === element.tag) {
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End);
  } else {
    throw new Error(`lack end tag:${element.tag}`);
  }

  return element;
}

function parseTag(context: any, type: TagType) {
  // 解析tag并删除
  const match: any = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source);
  const tag = match[1];
  // 这里删去已经消费的字符,或者说移动读字符的指针
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  // 处理结束标签时不用返回值
  if (type === TagType.End) return;
  // let tagType = ElementTypes.ELEMENT;
  return {
    type: NodeTypes.ELEMENT,
    tag,
    // tagType,
  };
}

function parseText(context: any) {
  const source = context.source;
  let endToken = ["<", "{{"];
  let endIndex = source.length;
  for (let i = 0; i < endToken.length; i++) {
    const index = source.indexOf(endToken[i]);
    // 有插值的话，就先停在插值处，处理前面已经解析好的字符
    // 我们希望index尽可能偏左，尽可能小，尽可能取<再取{
    if (index !== -1 && index < endIndex) {
      endIndex = index;
    }
  }

  // 抽出来到下面parseTextData里
  const content = parseTextData(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}
// 因为要处理text和interpolation的不同进度，所以加个length控制消费字符的数量
function parseTextData(context: any, length: number) {
  // 获取content内容
  const content = context.source.slice(0, length);
  // 推进/字消符费;
  advanceBy(context, length);
  // 这后面还要加判断html实体的
  return content;
}

// 这部分也要继续加
// function parseComment(context: any) {
//   if (startsWith(context.source, "<!--")) {
//     let content;
//     const match = /--(\!)?>/.exec(context.source);
//     content = context.source.slice(4, match.index);
//     // advanceBy(context, match.index + match[0].length - );

//     return {
//       type: NodeTypes.COMMENT,
//       content,
//     };
//   }
// }

// 消费字符的工具函数
function advanceBy(context, length) {
  context.source = context.source.slice(length);
}

function startsWith(source: string, searchString: string): boolean {
  return source.startsWith(searchString);
}

// 判断是否缺少响应的结束标签
function startsWithEndTagOpen(source, tag) {
  if (source.startsWith("</")) {
    return source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
  }
}
