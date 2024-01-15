import { describe, expect, test, vi } from "vitest";
import { reactive } from "../reactive";
import { computed } from "../computed";

describe("computed", () => {
  test("core path", () => {
    const user = reactive({ age: 1 });
    const age = computed(() => user.age);
    expect(age.value).toBe(1);
  });
  test("should compute lazily", () => {
    const value = reactive({ foo: 1 });
    const getter = vi.fn(() => value.foo);
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    // 这里触发get，看后面能不能直接用缓存
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    // 触发set，实际上触发了两次，为了具体控制，还是要加scheduler
    // 响应式的值重新改变之后就会再次触发getter
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
