import { describe, test, expect } from "vitest";
import { NodeTypes, ElementTypes } from "../ast";
import { baseParse } from "../parse";

describe("parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{message}}");
      const interpolation = ast.children[0]; //这里也有个自定义的推断

      expect(interpolation).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `message`,
        },
      });
    });
    // 边角情况，括号里有多余空格
    test("space in interpolation", () => {
      const ast2 = baseParse("{{  message  }}");
      const interpolation2 = ast2.children[0];
      expect(interpolation2).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `message`,
        },
      });
    });
  });
});

describe("element", () => {
  test("simple div", () => {
    const ast = baseParse("<div></div>");
    const element = ast.children[0];

    expect(element).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [],
    });
  });
});

describe("text", () => {
  test("simple text", () => {
    const ast = baseParse("hello world");
    const text = ast.children[0];
    expect(text).toStrictEqual({
      type: NodeTypes.TEXT,
      content: "hello world",
    });
  });
});

test("mixed type parse", () => {
  const ast = baseParse("<div>hello,{{message}}</div>");
  const element = ast.children[0];

  expect(element).toStrictEqual({
    type: NodeTypes.ELEMENT,
    tag: "div",
    children: [
      {
        type: NodeTypes.TEXT,
        content: "hello,",
      },
      {
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      },
    ],
  });
});

test("nested tags", () => {
  const ast = baseParse("<div><p>hello</p>{{message}}</div>");
  const element = ast.children[0];

  expect(element).toStrictEqual({
    type: NodeTypes.ELEMENT,
    tag: "div",
    children: [
      {
        type: NodeTypes.ELEMENT,
        tag: "p",
        children: [
          {
            type: NodeTypes.TEXT,
            content: "hello",
          },
        ],
      },
      {
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      },
    ],
  });
});

test("should throw error when lack end tag", () => {
  expect(() => {
    baseParse("<div><span></div>");
  }).toThrow("lack end tag:span");
});
