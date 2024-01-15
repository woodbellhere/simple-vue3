import { describe, expect, test } from "vitest";
import { baseParse } from "../parse";
import { transform } from "../transform";
import { NodeTypes } from "../ast";

describe("transform", () => {
  test("core path", () => {
    const ast = baseParse("<div>hello,{{message}}</div>");
    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + " mini-vue";
      }
    };
    transform(ast, {
      nodeTransforms: [plugin],
    });
    const nodeText = ast.children[0].children[0];
    // expect(nodeText.content).toBe("hello, mini-vue");
    expect(nodeText.content).toBe("hello, mini-vue");
  });
});
