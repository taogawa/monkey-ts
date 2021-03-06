import { Parser } from '../parser/parser';
import { Lexer } from '../lexer/lexer';
import {
  BaseObject,
  IntegerObject,
  BooleanObject,
  NullObject,
  ErrorObject,
  FunctionObject,
  StringObject,
  ArrayObject,
  HashObject,
} from '../object/object';
import { evaluate, TRUE, FALSE } from '../evaluator/evaluator';
import { Environment } from '../object/environment';

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
      input: `"Hello" - "World"`,
      expectedMessage: 'unknown operator: STRING - STRING',
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
    {
      input: `{"name": "Monkey"}[fn(x) { x }];`,
      expectedMessage: 'unusable as hash key: FUNCTION',
    },
  ];
  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    const errObj = evaluated as ErrorObject;
    expect(errObj.constructor).toBe(ErrorObject);
    expect(errObj.message).toBe(tt.expectedMessage);
  });
});

test('function object', () => {
  const input = 'fn(x) { x + 2; };';

  const evaluated = testEvaluate(input);
  const fn = evaluated as FunctionObject;
  expect(fn.constructor).toBe(FunctionObject);
  expect(fn.parameters.length).toBe(1);
  expect(fn.parameters[0].toString()).toBe('x');
  const expectedBody = '(x + 2)';
  expect(fn.body.toString()).toBe(expectedBody);
});

test('function application', () => {
  const tests: Array<{
    input: string;
    expected: number;
  }> = [
    { input: 'let identity = fn(x) { x; }; identity(5);', expected: 5 },
    { input: 'let identity = fn(x) { return x; }; identity(5);', expected: 5 },
    { input: 'let double = fn(x) { x * 2; }; double(5);', expected: 10 },
    { input: 'let add = fn(x, y) { x + y; }; add(5, 5);', expected: 10 },
    {
      input: 'let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));',
      expected: 20,
    },
    { input: 'fn(x) { x; }(5)', expected: 5 },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    testIntegerObject(evaluated!, tt.expected); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  });
});

test('closures', () => {
  const input = `
 let newAdder = fn(x) {
   fn(y) { x + y }
 };

 let addTwo = newAdder(2);
 addTwo(2);
 `;
  testIntegerObject(testEvaluate(input)!, 4); // eslint-disable-line @typescript-eslint/no-non-null-assertion
});

test('StringLiteral', () => {
  const input = `"Hello World!"`;

  const evaluated = testEvaluate(input);
  const str = evaluated as StringObject;
  expect(str.constructor).toBe(StringObject);
  expect(str.value).toBe('Hello World!');
});

test('string concatenation', () => {
  const input = `"Hello" + " " + "World!"`;

  const evaluated = testEvaluate(input);
  const str = evaluated as StringObject;
  expect(str.constructor).toBe(StringObject);
  expect(str.value).toBe('Hello World!');
});

test('builtin functions', () => {
  const tests: Array<{
    input: string;
    expected: number | string | number[] | undefined;
  }> = [
    { input: `len("")`, expected: 0 },
    { input: `len("four")`, expected: 4 },
    { input: `len("hello world")`, expected: 11 },
    {
      input: `len(1)`,
      expected: 'argument to `len` not supported, got INTEGER',
    },
    {
      input: `len("one", "two")`,
      expected: 'wrong number of arguments. got=2, want=1',
    },
    { input: `len([1, 2, 3])`, expected: 3 },
    { input: `len([])`, expected: 0 },
    { input: `puts("hello", "world!")`, expected: undefined },
    { input: `first([1, 2, 3])`, expected: 1 },
    { input: `first([])`, expected: undefined },
    {
      input: `first(1)`,
      expected: 'argument to `first` must be ARRAY, got INTEGER',
    },
    { input: `last([1, 2, 3])`, expected: 3 },
    { input: `last([])`, expected: undefined },
    {
      input: `last(1)`,
      expected: 'argument to `last` must be ARRAY, got INTEGER',
    },
    { input: `rest([1, 2, 3])`, expected: [2, 3] },
    { input: `rest([])`, expected: undefined },
    { input: `push([], 1)`, expected: [1] },
    {
      input: `push(1, 1)`,
      expected: 'argument to `push` must be ARRAY, got INTEGER',
    },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    const expected = tt.expected;
    switch (typeof expected) {
      case 'number': {
        testIntegerObject(evaluated!, expected); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        break;
      }
      case 'string': {
        const errObj = evaluated as ErrorObject;
        expect(errObj.constructor!).toBe(ErrorObject); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        expect(errObj.message).toBe(expected);
        break;
      }
    }
  });
});

test('array literals', () => {
  const input = '[1, 2 * 2, 3 + 3]';
  const evaluated = testEvaluate(input);

  const result = evaluated as ArrayObject;
  expect(result.constructor).toBe(ArrayObject);
  expect(result.elements.length).toBe(3);
  testIntegerObject(result.elements[0], 1);
  testIntegerObject(result.elements[1], 4);
  testIntegerObject(result.elements[2], 6);
});

test('index expressions', () => {
  const tests: Array<{
    input: string;
    expected: number | null;
  }> = [
    {
      input: '[1, 2, 3][0]',
      expected: 1,
    },
    {
      input: '[1, 2, 3][1]',
      expected: 2,
    },
    {
      input: '[1, 2, 3][2]',
      expected: 3,
    },
    {
      input: 'let i = 0; [1][i];',
      expected: 1,
    },
    {
      input: '[1, 2, 3][1 + 1];',
      expected: 3,
    },
    {
      input: 'let myArray = [1, 2, 3]; myArray[2];',
      expected: 3,
    },
    {
      input: 'let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];',
      expected: 6,
    },
    {
      input: 'let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]',
      expected: 2,
    },
    {
      input: '[1, 2, 3][3]',
      expected: null,
    },
    {
      input: '[1, 2, 3][-1]',
      expected: null,
    },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    if (tt.expected != undefined) {
      testIntegerObject(evaluated, tt.expected);
    } else {
      testNullObject(evaluated);
    }
  });
});

test('hash literals', () => {
  const input = `let two = "two";
  {
    "one": 10 - 9,
    two: 1 + 1,
    "thr" + "ee": 6 / 2,
    4: 4,
    true: 5,
    false: 6
  }`;

  const evaluated = testEvaluate(input);

  const result = evaluated as HashObject;
  expect(result.constructor).toBe(HashObject);

  const expected: Map<string, number> = new Map<string, number>([
    [new StringObject('one').hashKey(), 1],
    [new StringObject('two').hashKey(), 2],
    [new StringObject('three').hashKey(), 3],
    [new IntegerObject(4).hashKey(), 4],
    [TRUE.hashKey(), 5],
    [FALSE.hashKey(), 6],
  ]);

  expect(result.pairs.size).toBe(expected.size);

  for (const [expectedKey, expectedValue] of expected) {
    const pair = result.pairs.get(expectedKey);
    testIntegerObject(pair!.value, expectedValue);  // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }
});

test('hash index expressions', () => {
  const tests: Array<{
    input: string;
    expected: number | undefined;
  }> = [
    {
      input: `{"foo": 5}["foo"]`,
      expected: 5,
    },
    {
      input: `{"foo": 5}["bar"]`,
      expected: undefined,
    },
    {
      input: `let key = "foo"; {"foo": 5}[key]`,
      expected: 5,
    },
    {
      input: `{}["foo"]`,
      expected: undefined,
    },
    {
      input: `{5: 5}[5]`,
      expected: 5,
    },
    {
      input: `{true: 5}[true]`,
      expected: 5,
    },
    {
      input: `{false: 5}[false]`,
      expected: 5,
    },
  ];

  tests.forEach((tt) => {
    const evaluated = testEvaluate(tt.input);
    if (typeof tt.expected === 'number') {
      testIntegerObject(evaluated, tt.expected);
    } else {
      testNullObject(evaluated);
    }
  });
});

const testEvaluate = (input: string): BaseObject => {
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  const env = new Environment();

  return evaluate(program, env);
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
