class Dep {
  constructor() {
    this.subscriber = new Set();
  }

  // addEffect(effect) {
  //   this.subscriber.add(effect);
  // }

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

let activeEffect = null;
function watchEffect(effect) {
  activeEffect = effect;
  // dep.addEffect(effect);
  dep.depend();
  effect();
  activeEffect = null;
}

const targetMap = new WeakMap();
function getDep(target, key) {
  const depsMap = targetMap.get(target);
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

// vue2
function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    const dep = getDep(raw, key);
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
function reactive3(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key);
      dep.depend();
      return target[key];
    },
    set(target, key, newValue) {
      const dep = getDep(target, key);
      target[key] = newValue;
      dep.notify();
    },
  });
}

const info = reactive({ counter: 100 });
const foo = reactive({ height: 1.8 });

watchEffect(function doubleCounter() {
  console.log(info.counter * 2);
});

watchEffect(function powerCounter() {
  console.log(info.counter * info.counter);
});

// dep.addEffect(doubleCounter);
// dep.addEffect(powerCounter);
info.counter++;
// doubleCounter();
dep.notify();
