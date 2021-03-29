import { Parser } from '../parser/parser';
import { Lexer } from '../lexer/lexer';
import {
  BaseObject,
  IntegerObject,
  BooleanObject,
  NullObject,
  ErrorObject,
} from '../object/object';
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
    { input: 'true == true', expected: true },
    { input: 'false == false', expected: true },
    { input: 'true == false', expected: false },
    { input: 'true != false', expected: true },
    { input: 'false != true', expected: true },
    { input: '(1 < 2) == true', expected: true },
    { input: '(1 < 2) == false', expected: false },
    { input: '(1 > 2) == true', expected: false },
    { input: '(1 > 2) == false', expected: true },
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

test('if else expressions', () => {
  const tests: Array<{
    input: string;
    expected: number | undefined;
  }> = [
    { input: 'if (true) { 10 }', expected: 10 },
    { input: 'if (false) { 10 }', expected: undefined },
    { input: 'if (1) { 10 }', expected: 10 },
    { input: 'if (1 < 2) { 10 }', expected: 10 },
    { input: 'if (1 > 2) { 10 }', expected: undefined },
    { input: 'if (1 > 2) { 10 } else { 20 }', expected: 20 },
    { input: 'if (1 < 2) { 10 } else { 20 }', expected: 10 },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    const integer = tt.expected as number;
    if (integer != null) {
      testIntegerObject(evaluated!, integer); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    } else {
      testNullObject(evaluated!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
  });
});

test('return statements', () => {
  const tests: Array<{
    input: string;
    expected: number | undefined;
  }> = [
    { input: 'return 10;', expected: 10 },
    { input: 'return 10; 9;', expected: 10 },
    { input: 'return 2 * 5; 9;', expected: 10 },
    { input: '9; return 2 * 5; 9;', expected: 10 },
    {
      input: `
if (10 > 1) {
  if (10 > 1) {
    return 10;
  }
  return 1;
}
`,
      expected: 10,
    },
  ];
  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    testIntegerObject(evaluated!, tt.expected!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  });
});

test('test error handling', () => {
  const tests: Array<{
    input: string;
    expectedMessage: string;
  }> = [
    {
      input: '5 + true;',
      expectedMessage: 'type mismatch: INTEGER + BOOLEAN',
    },
    {
      input: '5 + true; 5;',
      expectedMessage: 'type mismatch: INTEGER + BOOLEAN',
    },
    {
      input: '-true',
      expectedMessage: 'unknown operator: -BOOLEAN',
    },
    {
      input: 'true + false;',
      expectedMessage: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: '5; true + false; 5',
      expectedMessage: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'if (10 > 1) { true + false; }',
      expectedMessage: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: `
if (10 > 1) {
  if (10 > 1) {
    return true + false;
  }
  return 1;
}
`,
      expectedMessage: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    {
      input: 'foobar',
      expectedMessage: 'identifier not found: foobar',
    },
  ];
  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    const errObj = evaluated as ErrorObject;

    expect(errObj.constructor).toBe(ErrorObject);
    expect(errObj.message).toBe(tt.expectedMessage);
  });
});

const testEvaluate = (input: string): BaseObject | undefined => {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();

  return evaluate(program);
};

const testIntegerObject = (obj: BaseObject, expected: number): void => {
  const result = obj as IntegerObject;
  expect(result.constructor).toBe(IntegerObject);
  expect(result.value).toBe(expected);
};

const testBooleanObject = (obj: BaseObject, expected: boolean): void => {
  const result = obj as BooleanObject;
  expect(result.constructor).toBe(BooleanObject);
  expect(result.value).toBe(expected);
};

const testNullObject = (obj: BaseObject): void => {
  expect(obj.constructor).toBe(NullObject);
};
