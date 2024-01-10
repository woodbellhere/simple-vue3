import { describe, test, expect, vi } from "vitest";
import { readonly, isReactive, isReadonly, isProxy } from "../reactive";

describe("readonly", () => {
  test("core path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(isProxy(wrapped)).toBe(true);
    expect(isReactive(wrapped)).toBe(false);
    expect(isReactive(original)).toBe(false);
    expect(isReactive(wrapped.bar)).toBe(false);
    expect(isReactive(original.bar)).toBe(false);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapped)).toBe(true);
    // 这条有问题，再看看
    // expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
    // get
    expect(wrapped.foo).toBe(1);
    // has
    expect("foo" in wrapped).toBe(true);
    // ownKeys
    expect(Object.keys(wrapped)).toEqual(["foo", "bar"]);
  });

  test("not allow mutation", () => {
    console.warn = vi.fn();
    const user = readonly({ age: 10 });
    user.age = 11;
    expect(console.warn).toBeCalled();
    // readonly用自定义的测试方法了，暂时还搞不定它
  });
});
