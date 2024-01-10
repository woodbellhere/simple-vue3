export const extend = Object.assign;
export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value,
  });
};

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
