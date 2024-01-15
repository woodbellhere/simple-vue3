const State = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6,
};

// 判断是否为字母
function isAlpha(char) {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
}

function tokenize(str) {
  let currentState = State.initial;
  // 缓存字符
  const chars = [];
  // 存储生成的token并作为函数返回值返回
  const tokens = [];
  // 循环自动消费字符
  while (str) {
    // 查看第一个字符
    const char = str[0];
    switch (currentState) {
      // 在初始状态下
      case State.initial:
        // <括号则切换到标签开始，并消费字符
        if (char === "<") {
          currentState = State.tagOpen;
          str = str.slice(1);
          // 如果是字母则切换到文本状态并消费字符
        } else if (isAlpha(char)) {
          currentState = State.text;
          chars.push(char);
          str = str.slice(1);
        }
        break;
      // 在标签开始状态下
      case State.tagOpen:
        // 如果是字母则进入标签名状态，缓存并消费字符
        if (isAlpha(char)) {
          currentState = State.tagName;
          chars.push(char);
          str = str.slice(1);
          // /下划线则进入标签结束状态，并消费字符
        } else if (char === "/") {
          currentState = State.tagEnd;
          str = str.slice(1);
        }
        break;
      // 在标签名称状态下
      case State.tagName:
        // 如果是字母，则缓存且消费字符
        if (isAlpha(char)) {
          char.push(char);
          str = str.slice(1);
          // >括号则（结束名字读取）进入初始状态，并利用chars数组缓存的字符创建一个完整的token加入token数组
          // 然后清除chars数组，开始消费新字符
        } else if (char === ">") {
          currentState = State.initial;
          tokens.push({
            type: "tag",
            name: chars.join(""),
          });
          chars.length = 0;
          str = str.slice(1);
        }
        break;
      // 在文本状态下
      case State.text:
        // 如果是字母则正常缓存并消费字符
        if (isAlpha(char)) {
          chars.push(char);
          str = str.slice(1);
          // <括号则进入标签开始状态，利用chars数组缓存的字符创建完整token加入token数组
          // 然后清除chars数组，开始消费新字符
        } else if (char === "<") {
          currentState = State.tagOpen;
          tokens.push({
            type: "text",
            value: chars.join(""),
          });
          chars.length = 0;
          str = str.slice(1);
        }
        break;
      // 在标签结束状态下
      case State.tagEnd:
        // 如果是字母则进入标签结束状态，并缓存和消费新字符
        if (isAlpha(char)) {
          currentState = State.tagEndName;
          chars.push(char);
          str = str.slice(1);
        }
        break;
      // 在标签名结束状态下
      case State.tagEndName:
        // 如果是字母继续缓存并消费字符
        if (isAlpha(char)) {
          chars.push(char);
          str = str.slice(1);
          // >括号则结束读取，回到初始状态，利用chars数组缓存字符创建完整token加入token数组
          // 清除chars数组并开始消费字符
        } else if (char === ">") {
          currentState = State.initial;
          tokens.push({
            type: "tagEnd",
            name: chars.join(""),
          });
          chars.length = 0;
          str = str.slice(1);
        }
        break;
    }
  }
  // 返回token数组
  return tokens;
}

const tokens = tokenize(`<p>Vue</p>`);

// transform
// 扫描token列表，维护一个stack用于维护元素间的父子关系
// 遇到一个开始标签节点就构造一个element类型的ast节点压栈
// 遇到结束标签节点就出栈
// 中间的元素就设置为前面元素的子元素
// 这样栈底始终有一个我们自定义的root
