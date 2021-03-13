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
