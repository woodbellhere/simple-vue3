import {
  trackEffects,
  triggerEffects,
  isTracking,
  activeEffect,
  shouldTrack,
} from "./effect";
import { hasChange, isFunction, isObject } from "../shared";
import { isReactive, reactive, toRaw } from "./reactive";

// 这种嵌套生成真是源码写法
export function ref(value) {
  // return new RefImpl(value);
  return createRef(value);
}

export function shallowRef(value) {
  return createRef(value);
}

// 抽出来主要是为了ref和shallowref共用的shallow
function createRef(rawValue) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue);
}

class RefImpl {
  private _value: any;
  private _rawValue: any;
  public dep?;
  // 直接用内部属性来做判断，跟reactive一样
  public readonly __v_isRef = true;

  constructor(value) {
    // 由于reactive会给一个proxy对象，但我们需要原对象
    this._rawValue = value;
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
    if (hasChange(newValue, this._rawValue)) {
      // 修改value并触发
      // 重复了，抽出去
      // this._value = isObject(newValue) ? reactive(newValue) : newValue;
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerRefValue(this);
    }
  }
}

class GetterRefImpl {
  public readonly __v_isRef = true;
  public readonly __v_isReadonly = true;
  constructor(private readonly _getter) {}
  // 传入getter/计算值，调用就返回
  get value() {
    return this._getter();
  }
}

class ObjectRefImpl {
  public readonly __v_isRef = true;

  constructor(
    private readonly _object,
    public readonly _key,
    private readonly _defaultValue?
  ) {}

  get value() {
    const val = this._object[this._key];
    return val === undefined ? this._defaultValue : val;
  }

  set value(newValue) {
    this._object[this._key] = newValue;
  }

  // get dep()
}

function propertyToRef(source, key, defaultValue?) {
  const val = source[key];
  return isRef(val) ? val : new ObjectRefImpl(source, key, defaultValue);
}

export function trackRefValue(ref) {
  if (shouldTrack && activeEffect) {
    // ref只需要收集set这一部分就行
    // ref = toRaw(ref);
    trackEffects(ref.dep);
  }
}

export function triggerRefValue(ref) {
  // ref = toRaw(ref);
  const dep = ref.dep;
  // ref = triggerEffects(ref.dep);
  trackEffects(dep);
}

export function isRef(ref) {
  return !!(ref && ref.__v_isRef === true);
}

export function toRef(source, key?, defaultValue?) {
  if (isRef(source)) return source;
  else if (isFunction(source)) return new GetterRefImpl(source);
  else if (isObject(source)) return propertyToRef(source, key, defaultValue);
  else return ref(source);
}

export function unRef(ref) {
  // 如果是ref对象，直接返回.value，如果不是，直接返回该值本身
  if (isRef(ref)) {
    return ref.value;
  }
  return ref;
}

export function proxyRefs(objectWithRefs) {
  if (isReactive(objectWithRefs)) return objectWithRefs;
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

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}
