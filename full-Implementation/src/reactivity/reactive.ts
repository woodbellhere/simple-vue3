import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

import { def, isObject, toRawType } from "../shared";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  IS_SHALLOW = "__v_isShallow",
  RAW = "__v_raw",
  SKIP = "__v_skip",
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
  [ReactiveFlags.IS_SHALLOW]?: boolean;
  [ReactiveFlags.RAW]?: boolean;
  [ReactiveFlags.SKIP]?: any;
}

// 迂回的类型判断工具
const enum TargetType {
  INVALID = 0,
  COMMON = 1,
  COLLECTION = 2,
}

function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return TargetType.COMMON;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return TargetType.COLLECTION;
    default:
      return TargetType.INVALID;
  }
}

function getTargetType(value) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
    ? TargetType.INVALID
    : targetTypeMap(toRawType(value));
}

// 到这才正式开始reactive
// 可以发现reactive系列都要有get和set这些，其实文档里也统称handler，完全可以抽离出来
// 返回对象的响应式proxy，且默认是deep的
export function reactive(raw) {
  // 如果传入readonly，直接返回
  if (isReadonly(raw)) return raw;
  return createReactiveObject(raw, mutableHandlers);
}

// 因为reactive系列函数都return new Proxy也有点啰嗦，所以还可以再抽取
// 说实话可能大项目见得少，多少觉得有点繁琐
// 确实遵循了出现两次及以上就抽出来的原则
function createReactiveObject(raw, handlers) {
  return new Proxy(raw, handlers);
}

// 只响应一层的reactive版本，属性存取不带额外操作，所以ref属性不会自动解包
// function shallowReactive(raw) {
//   return createReactiveObject(raw, shallowReadonlyHandlers);
// }

// 只读版本嘛，看源码就是把生成proxy的配置变了，set和delete都是空的
export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers);
}

// is判断系列
// is类的都是直接返回flag，实际上是主动通过get传个通信
// 这里！！两次取反是为了转化布尔值，这样handlers里才读的到

// 检查传入对象是否为reactive，shallowReactive创造的proxy，以及ref的特定情况
// 这么一看源码真的好朴实无华
export function isReactive(value) {
  // if (isReadonly(value)) {
  //   return isReactive(value[ReactiveFlags.RAW]);
  // }
  // 随便什么key都能触发get
  // 记得返回布尔值
  return !!value[ReactiveFlags.IS_REACTIVE];
}

// readonly对象还是响应式的，但不能直接通过这个响应式对象修改，或者说就是冻结修改
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isShallow(value) {
  return !!value[ReactiveFlags.IS_SHALLOW];
}

// 检查传入对象是否为reactive创造的proxy
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}

// to转换系列
// 如果是对象则正常包裹，不是就返回
export const toReactive = (value) => {
  isObject(value) ? reactive(value) : value;
};

export const toReadonly = (value) => {
  isObject(value) ? readonly(value) : value;
};

// 返回响应式proxy的原始对象
export function toRaw(observed) {
  const raw = observed && observed[ReactiveFlags.RAW];
  return raw ? toRaw(raw) : observed;
}

// 打标记让该对象不会被响应化，也不会返回proxy
function markRaw(value) {
  def(value, ReactiveFlags.SKIP, true);
  return value;
}
