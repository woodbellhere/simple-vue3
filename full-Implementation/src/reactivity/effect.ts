// 总体上这个工具函数还挺莫名奇妙的
import { extend } from "../shared";
import { TrackOperationType, TriggerOperationType } from "./operation";
// 最早的版本中我们硬编码fn，过于不灵活，所以专门搞一个activeEffect来存当前fn
export let activeEffect: ReactiveEffect | undefined;
const targetMap = new WeakMap();
// 由于set和get触发方式比较随意，所以用一个显示变量来控制track行为
export let shouldTrack = true;

type EffectScheduler = (...args: any[]) => any;

interface ReactiveEffectRunner {
  ();
  effect: ReactiveEffect;
}

type DebuggerEvent = {
  effect: ReactiveEffect;
} & DebuggerEventExtraInfo;

type DebuggerEventExtraInfo = {
  target: object;
  type: TrackOperationType | TriggerOperationType;
  key: any;
  newValue?: any;
  oldValue?: any;
  oldTarget?: Map<any, any> | Set<any>;
};

interface ReactiveEffectOptions extends DebuggerOptions {
  lazy?: boolean;
  scheduler?: EffectScheduler;
  // scope实际是 EffectScope
  scope?: any;
  allowRecurse?: boolean;
  onStop?: () => void;
}

// 指明effect接收函数的类型
export class ReactiveEffect {
  private _fn: any;
  // effect用于反向收集dep的数组
  deps = [];
  // active用于避免重复清理effect,基本就是说它还是不是activeEffect
  active = true;

  computed?: any;
  allowRecurse?: boolean;
  private deferStop?: boolean;

  // stop方法应该触发一次的事件
  onStop?: () => void;
  // 测试发现会有undefined，其实本来空函数就返回undefined
  constructor(public fn, public scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    // 这时候才成为当前活动效果函数
    if (!this.active) return this._fn();
    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    return result;
  }
  stop() {
    // cleanupEffect的源头
    // 也防止多次清空
    // this.deps.forEach((dep: any) => {
    //   dep.delete(this);
    // });
    // shouldtrack就是为了这里不乱清理
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect;
  if (deps.length) {
    // 源码用for
    deps.forEach((dep: any) => {
      dep.delete(effect);
    });
    // 源码确保清零，整个deps没意义了
    deps.length = 0;
  }
}

export function effect(fn, options: any = {}) {
  if (fn.effect) fn = fn.effect.fn;
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // Object.assign(_effect, options);
  // _effect.onStop = options.onStop;
  extend(_effect, options);
  _effect.run();

  // 注意这里的this让reactiveEffect绑定过了，所以返回的函数为了保证面向effect执行，要做一个保险
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// 用于停止和给定runner关联的作用函数
// runner让我们能在effect创建后仍能控制它
// A runner that can be used to control the effect after creation.
export function stop(runner) {
  runner.effect.stop();
}

export function track(target, key) {
  // 因为单纯的get触发track是不会有activeEffect，所以直接返回完事
  if (!shouldTrack || !activeEffect) return;
  // 核心就这俩数据结构，其他都是预防性的初始化
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }

  trackEffects(deps);
}
// ref只收集一个effect，只有一个set，其他操作跟它没关系，可以单独抽出来一步
export function trackEffects(deps) {
  // 这是个常见的缓存返回
  if (deps.has(activeEffect)) return;
  deps.add(activeEffect);
  // activeEffect不一定被effect过
  (activeEffect as any).deps.push(deps);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  // 没缓存直接返回
  if (!depsMap) return;
  let deps = depsMap.get(key);
  triggerEffects(deps);
}
// 和trackeffect一样，都只需要触发一部分
export function triggerEffects(deps) {
  // 抄源码
  for (const effect of deps) {
    // computed里传的scheduler就在这重新触发
    if (effect.scheduler) effect.scheduler();
    else effect.run();
  }
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}
