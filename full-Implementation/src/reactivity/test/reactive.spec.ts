import { describe, expect, test } from "vitest";
import { reactive, isReactive, isProxy } from "../reactive";

describe("reactive", () => {
  test("core path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    // 这两步会在activeEffect为undefined时出错
    expect(observed).not.toBe(original);
    // 这个行为说明我们八成要返回一个布尔值
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
    expect(isProxy(observed)).toBe(true);
    // get
    expect(observed.foo).toBe(1);
    // has
    expect("foo" in observed).toBe(true);
    // ownKeys
    expect(Object.keys(observed)).toEqual(["foo"]);
  });
});
