let activeEffect = null;

class Dep {
  constructor(value) {
    this.subscriber = new Set();
    this._value = value;
  }
  get value() {
    // 读取值说明其他函数要用了，加入依赖
    this.depend();
    return this._value;
  }
  set value(newValue) {
    // 修改值也要通知所有依赖重新执行
    this._value = newValue;
    this.notify();
  }

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
  dep.depend();
  // 还是假设是同步了
  effect();
  activeEffect = null;
}

// 简单依赖的情况
const dep = new Dep("hello");
watchEffect(() => {
  // dep.depend();
  console.log(dep.value);
});
dep.value = "changed";
// dep.notify();

// 多个分支/依赖的情况
const ok = new Dep(true);
const msg = new Dep("bell");

watchEffect(() => {
  if (ok.value) {
    console.log(msg.value);
  } else {
    console.log("false branch");
  }
});
