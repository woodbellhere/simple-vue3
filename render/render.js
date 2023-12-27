const h = (tag, props, children) => {
  return {
    tag,
    props,
    children,
  };
};

const mount = (vnode, container) => {
  // 创建真实dom 还想麻烦了
  const el = (vnode.el = document.createElement(vnode.tag));
  // 遍历挂载prop到dom上
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];
      // 区分事件和属性
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  // 挂载子节点
  if (typeof vnode.children === "string") {
    el.textContent = vnode.children;
  } else {
    vnode.children.forEach((item) => {
      mount(item, el);
    });
  }

  // 把el挂载到container上
  container.appendChild(el);
};

// 节点对比更新时
const patch = (n1, n2) => {
  // 首先对比tag
  if (n1.tag !== n2.tag) {
    const n1Parent = n1.parentElement;
    n1Parent.removeChild(n1.el);
    // 直接把新元素挂载原容器上省事
    mount(n2, n1Parent);
  } else {
    // 如果是同一类标签，则准备对prop下手，首先保存元素
    const el = (n2.el = n1.el);

    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 把前面挂属性变成覆盖旧属性
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      // 如果属性不等则开始替换
      if (newValue !== oldValue) {
        if (key.startsWith("on")) {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.setAttribute(key, newValue);
        }
      }
    }
    // 然后删除旧的props
    for (const key in oldProps) {
      if (!(key in newProps)) {
        if (key.startsWith("on")) {
          const value = oldProps[key];
          el.removeEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.removeAttribute(key, value);
        }
      }
    }
    // 处理children
    const oldChildren = n1.children || [];
    const newChildren = n2.children || [];
    // newchildren是string时
    if (typeof newChildren === "string") {
      if (typeof oldChildren === "string") {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren;
        }
      } else {
        el.innerHTML = newChildren;
      }
      // 是数组时
    } else {
      // 两个节点一个为单个string，一个为一个数组时
      if (typeof oldChildren === "string") {
        el.innerHTML = "";
        newChildren.forEach((item) => {
          mount(item, el);
        });
      } else {
        const commonLength = Math.min(oldChildren.length, newChildren.length);
        // 相同节点进行patch
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }
        // 如果新比旧长则挂载child
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach((item) => {
            mount(item, el);
          });
        }
        // 如果旧比新长则删除多余child
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach((item) => {
            el.removeChild(item.el);
          });
        }
      }
    }
  }
};
