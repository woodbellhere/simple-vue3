import { expect } from "vitest";
import { generate } from "./generate";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformElement } from "./transforms/transformElement";
import { transformExpression } from "./transforms/transformExpression";
import { transformText } from "./transforms/transformText";

export function baseCompiler(template) {
  const ast = baseParse(template);
  transform(ast, {
    nodeTransfroms: [transformExpression, transformElement, transformText],
  });

  const { code } = generate(ast);
  expect(code).toMatchSnapshot();
}
