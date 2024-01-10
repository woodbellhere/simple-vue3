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

// vue2
function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    // 这就是所谓基于属性做监听
    const dep = new Dep();
    let value = raw[key];
    Object.defineProperty(raw, key, {
      get() {
        dep.depend();
        return value;
      },
      set(newValue) {
        value = newValue;
        dep.notify();
      },
    });
  });
  return raw;
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

// const state = reactive({ count: 0 });
const state = reactive3({ count: 0 });

watchEffect(() => {
  console.log(state.count);
  console.log("msg" in state);
  // 下面这条在vue2里可能就不行，虽然也只是取key打印的简单操作
  Object.keys(state).forEach((key) => console.log(key));
});
