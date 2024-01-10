import { describe, expect, test } from "vitest";
import { effect } from "../effect";
import { reactive } from "../reactive";
import { ref, isRef, unRef, proxyRefs } from "../ref";

describe("ref", () => {
  test("core path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
    a.value = 2;
    expect(a.value).toBe(2);
  });
  test("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    // 这里一看也需要前面依赖收集那些
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // same value should not trigger
    // 让ref的set在新值相比原始值发生变化时才触发依赖
    a.value = 2;
    expect(calls).toBe(2);
  });
  test("should make nested properties reactive", () => {
    // 对象在ref中需要特别处理，也就是调reactive
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });
  test("isRef", () => {
    const a = ref(1);
    const user = reactive({ age: 1 });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });
  test("unRef", () => {
    const a = ref(1);
    const user = reactive({ age: 1 });
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
    expect(unRef(user)).toBe(user);
  });
  test("proxyRef", () => {
    const user = { age: ref(10), name: "woodbell" };
    const proxyUser = proxyRefs(user);
    // get部分
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe("woodbell");
    // set部分
    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);
  });
});
