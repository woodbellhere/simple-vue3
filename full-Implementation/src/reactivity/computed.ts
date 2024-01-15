import { trackRefValue, triggerRefValue } from "./ref";
import { ReactiveEffect } from "./effect";
import { ReactiveFlags } from "./reactive";

export function computed(getter) {
  return new ComputedRefImpl(getter);
}

class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean = true; // 初始为未修改的不脏状态
  private _value: any; //这就算缓存的值了
  private _effect: ReactiveEffect; // 用来依赖收集
  public readonly __v_isRef = true; // 标识为ref
  public readonly [ReactiveFlags.IS_READONLY] = true; // 标识为只读

  constructor(getter) {
    this._getter = getter;
    // 当依赖的响应式对象值改变时，也一道将dirty置为true
    this._effect = new ReactiveEffect(getter, () => {
      if (this._dirty) return;
      this._dirty = true; // 初始为已缓存状态
      triggerRefValue(this);
    });
  }

  get value() {
    // 收集依赖
    // trackRefValue(this);
    // 也就是被effect时
    if (this._dirty) {
      this._dirty = false; // 设置为已缓存
      // this._value = this._getter(); // 把传入getter的结果缓存到value中
      this._value = this._effect.run();
    }
    return this._value;
  }
}
