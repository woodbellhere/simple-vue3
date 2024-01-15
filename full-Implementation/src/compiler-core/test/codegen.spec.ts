import { describe, expect, test } from "vitest";
import { baseParse } from "../parse";
import { generate } from "../generate";
import { transform } from "../transform";
import { transformExpression } from "../transforms/transformExpression";
import { transformElement } from "../transforms/transformElement";
import { transformText } from "../transforms/transformText";
describe("codegen", () => {
  test("string", () => {
    const ast = baseParse("h1");
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });

  test("interpolation", () => {
    const ast = baseParse("{{message}}");
    transform(ast, {
      nodeTransforms: [transformExpression],
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });

  test("element", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");
    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText],
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});
