import { Parser } from '../parser/parser';
import { Lexer } from '../lexer/lexer';
import { BaseObject, IntegerObject } from '../object/object';
import { evaluate } from '../evaluator/evaluator';

test('eval integer expression', () => {
  const tests: Array<{
    input: string;
    expected: number;
  }> = [
    { input: '5', expected: 5 },
    { input: '10', expected: 10 },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    expect(evaluated).not.toBe(undefined);
    if (evaluated != null) {
      testIntegerObject(evaluated, tt.expected);
    }
  });
});

const testEvaluate = (input: string): BaseObject | undefined => {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();

  return evaluate(program.statements[0]);
};

const testIntegerObject = (obj: BaseObject, expected: number): void => {
  const result = obj as IntegerObject;
  expect(result.constructor).toBe(IntegerObject);
  expect(result.value).toBe(expected);
};
