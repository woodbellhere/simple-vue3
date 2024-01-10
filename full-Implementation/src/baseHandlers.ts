import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";
import { extend, isObject } from "./shared";

// 重复使用的变量或函数都是用缓存更快
const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const set = createSetter();
const shallowSet = createSetter(true);

// 从reactive系列函数中抽离的get和set这些handlers
// 第二个参数控制shallow
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    // 最前面这部分是用来给几个is函数用的
    // 所以通过读预先设置的好key，很快就能判断是只读还是普通reactive对象
    // 这种预设直接抽出来变成枚举省事
    if (key === ReactiveFlags.IS_REACTIVE) return !isReadonly;
    if (key === ReactiveFlags.IS_READONLY) return isReadonly;

    const res = Reflect.get(target, key);
    // readonly时没有set，所以也不会触发trigger，也没必要收集依赖
    if (!isReadonly) track(target, key);
    // 如果浅层响应直接返回
    if (shallow) return res;
    if (isObject(res)) return isReadonly ? readonly(res) : reactive(res);
    return res;
  };
}

function createSetter(isReadonly = false) {
  return function set(target, key, value) {
    if (isReadonly) return true;
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

// 名字抄源码
export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    // 保证被读的时候有点报错反映
    console.warn("do not disturb this!");
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
