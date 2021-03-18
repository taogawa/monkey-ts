import { Parser } from '../parser/parser';
import { Lexer } from '../lexer/lexer';
import { BaseObject, IntegerObject, BooleanObject } from '../object/object';
import { evaluate } from '../evaluator/evaluator';

test('eval integer expression', () => {
  const tests: Array<{
    input: string;
    expected: number;
  }> = [
    { input: '5', expected: 5 },
    { input: '10', expected: 10 },
    { input: '-5', expected: -5 },
    { input: '-10', expected: -10 },
    { input: '5 + 5 + 5 + 5 - 10', expected: 10 },
    { input: '2 * 2 * 2 * 2 * 2', expected: 32 },
    { input: '-50 + 100 + -50', expected: 0 },
    { input: '5 * 2 + 10', expected: 20 },
    { input: '5 + 2 * 10', expected: 25 },
    { input: '20 + 2 * -10', expected: 0 },
    { input: '50 / 2 * 2 + 10', expected: 60 },
    { input: '2 * (5 + 10)', expected: 30 },
    { input: '3 * 3 * 3 + 10', expected: 37 },
    { input: '3 * (3 * 3) + 10', expected: 37 },
    { input: '(5 + 10 * 2 + 15 / 3) * 2 + -10', expected: 50 },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    expect(evaluated).not.toBe(undefined);
    if (evaluated != null) {
      testIntegerObject(evaluated, tt.expected); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
  });
});

test('eval boolean expression', () => {
  const tests: Array<{
    input: string;
    expected: boolean;
  }> = [
    { input: 'true', expected: true },
    { input: 'false', expected: false },
    { input: '1 < 2', expected: true },
    { input: '1 > 2', expected: false },
    { input: '1 < 1', expected: false },
    { input: '1 > 1', expected: false },
    { input: '1 == 1', expected: true },
    { input: '1 != 1', expected: false },
    { input: '1 == 2', expected: false },
    { input: '1 != 2', expected: true },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    expect(evaluated).not.toBe(undefined);
    testBooleanObject(evaluated!, tt.expected); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  });
});

test('bang operator', () => {
  const tests: Array<{
    input: string;
    expected: boolean;
  }> = [
    { input: '!true', expected: false },
    { input: '!false', expected: true },
    { input: '!5', expected: false },
    { input: '!!true', expected: true },
    { input: '!!false', expected: false },
    { input: '!!5', expected: true },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    expect(evaluated).not.toBe(undefined);
    testBooleanObject(evaluated!, tt.expected); // eslint-disable-line @typescript-eslint/no-non-null-assertion
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

const testBooleanObject = (obj: BaseObject, expected: boolean) => {
  const result = obj as BooleanObject;
  expect(result.constructor).toBe(BooleanObject);
  expect(result.value).toBe(expected);
};
