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
    // 如果是同一类标签，则准备对prop下手，
    // 首先保存元素且下一次更新自动新旧替换
    const el = (n2.el = n1.el);

    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 补充新prop节点，覆盖旧props节点
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      // 如果属性不等则开始替换
      if (newValue !== oldValue) {
        if (key.startsWith("on")) {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          // 更新的关键步骤，重写值
          el.setAttribute(key, newValue);
        }
      }
    }
    // 这样剩下的就是只在旧props中存在，新props里没有的节点了，删除即可
    for (const key in oldProps) {
      // 旧节点有而新节点中没有
      if (!(key in newProps)) {
        if (key.startsWith("on")) {
          const value = oldProps[key];
          el.removeEventListener(key.slice(2).toLowerCase(), value);
        } else {
          // 多余则删除
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
      // 两个chidlren一个为单个string，一个为一个数组时
      if (typeof oldChildren === "string") {
        el.innerHTML = "";
        newChildren.forEach((item) => {
          mount(item, el);
        });
        // 新旧children都为array时，这一部分对实际的diff算法做了简化
      } else {
        const commonLength = Math.min(oldChildren.length, newChildren.length);
        // 公共部分的内容进行patch，如果类型不同且顺序无保障，很可能出现无法预计的结果
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }
        // 如果新比旧长则增加一些新child
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

let activeEffect = null;

class Dep {
  subscriber = new Set();

  depend() {
    if (activeEffect) {
      this.subscriber.add(activeEffect);
    }
  }

  notify() {
    this.subscriber.forEach((effect) => {
      effect();
    });
  }
}

function watchEffect(effect) {
  activeEffect = effect;
  // dep.addEffect(effect);
  // 收集依赖
  // dep.depend();
  // 还是假设是同步了
  effect();
  activeEffect = null;
}

// vue3
const targetMap = new WeakMap();
function getDep(target, key) {
  // 与某个对象有关系的所有依赖
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}
const reactiveHandlers = {
  get(target, key, receiver) {
    const dep = getDep(target, key);
    dep.depend();
    // return target[key];
    // 似乎是说涉及到原型链时 一般的取key语法可能会取到不一样的东西，但reflect这个api效果稳定
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const dep = getDep(target, key);
    const result = Reflect.set(target, key, value, receiver);
    dep.notify();
    return result;
  },
  // 原来不存在的属性在临时添加时也会被捕获
  has() {},
  ownKey() {},
};

function reactive3(raw) {
  return new Proxy(raw, reactiveHandlers);
}

const App = {
  data: reactive3({
    count: 0,
  }),
  render() {
    return h(
      "div",
      {
        onClick: () => {
          this.data.count++;
        },
      },
      String(this.data.count)
    );
  },
};

// 这个相当于createApp和mount二合一
function mountApp(component, container) {
  let isMounted = false;
  let oldVdom;
  // 挂载之后会有一个watchEffect随时盯着组件变化
  watchEffect(() => {
    if (!isMounted) {
      oldVdom = component.render();
      mount(oldVdom, container);
      isMounted = true;
    } else {
      const newVdom = component.render();
      patch(oldVdom, newVdom);
      oldVdom = newVdom;
    }
  });
}

mountApp(App, document.getElementById("#app"));
