import { trackEffects, triggerEffects, isTracking } from "./effect";
import { hasChange, isObject } from "./shared";
import { reactive } from "./reactive";

// 这种嵌套生成真是源码写法
export function ref(value) {
  return new RefImpl(value);
}

class RefImpl {
  private _value: any;
  private _raw: any;
  public dep;
  // 直接用内部属性来做判断，跟reactive一样
  public __v_isRef = true;

  constructor(value) {
    // 由于reactive会给一个proxy对象，但我们需要原对象
    this._raw = value;
    // ref中传入的对象用reactive处理
    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    // 也抽出来
    // 仅在activeEffect/被effect过，也shouldTrack的情况下收集依赖
    // if (shouldTrack && activeEffect) {
    //   // ref只需要收集set这一部分就行
    //   trackEffects(this.dep);
    // }
    trackRefValue(this);
    // 不然直接返回
    return this._value;
  }
  set value(newValue) {
    // 仅在value发生变化时触发依赖
    // 学源码，抽一个hasChange
    // if (Object.is(newValue, this._value)) return;
    // 因为reactive会返回proxy对象，这里实际需要的还是原对象
    if (hasChange(newValue, this._raw)) {
      // 修改value并触发
      // 重复了，抽出去
      // this._value = isObject(newValue) ? reactive(newValue) : newValue;
      this._value = convert(newValue);
      this._raw = newValue;
      triggerRefValue(this);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function trackRefValue(ref) {
  if (isTracking()) {
    // ref只需要收集set这一部分就行
    trackEffects(ref.dep);
  }
}

export function triggerRefValue(ref) {
  triggerEffects(ref.dep);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  // 如果是ref对象，直接返回.value，如果不是，直接返回该值本身
  if (isRef(ref)) {
    return ref.value;
  }
  return ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // 如果是ref对象，直接返回.value，如果不是，直接返回该值本身
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      // 如果是ref对象，替换.value，如果不是，直接设置该值本身
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      }
      return Reflect.set(target, key, value);
    },
  });
}
