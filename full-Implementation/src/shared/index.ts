export const extend = Object.assign;

export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value,
  });
};

const cacheStringFunction = (fn) => {
  const cache = Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};

export const capitalize = cacheStringFunction(
  (str) => str.charAt(0).toUpperCase() + str.slice(1)
);

// vue团队实现的精品类型判断是吧
export const objectToString = Object.prototype.toString;
export const toTypeString = (value: unknown): string =>
  objectToString.call(value);
export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1);
};

// 记得取反，是判断有没有变化
export function hasChange(value, oldValue) {
  return !Object.is(value, oldValue);
}
export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const NOOP = () => {};
export const isObject = (val) => {
  return val !== null && typeof val === "object";
};
export const isFunction = (val) => typeof val === "function";
export const isString = (val) => typeof val === "string";
export const isArray = Array.isArray;
export const isSymbol = (val) => typeof val === "symbol";
export const isMap = (val) => toTypeString(val) === "[object Map]";
export const isIntegerKey = (key) => {
  isString(key) &&
    key !== "NaN" &&
    key[0] !== "-" &&
    "" + parseInt(key, 10) === key;
};
// export const makeMap;
