import {
  ExpressionStatement,
  Identifier,
  Bool,
  LetStatement,
  ReturnStatement,
  Statement,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  Expression,
  IfExpression,
  FunctionLiteral,
  CallExpression,
} from '../ast/ast';
import { Parser } from '../parser/parser';
import { Lexer } from '../lexer/lexer';

test('let statement', () => {
  const tests: Array<{
    input: string;
    expectedIdentifier: string;
    expectedValue: string | boolean | number;
  }> = [
    { input: 'let x = 5;', expectedIdentifier: 'x', expectedValue: 5 },
    { input: 'let y = true;', expectedIdentifier: 'y', expectedValue: true },
    {
      input: 'let foobar = y;',
      expectedIdentifier: 'foobar',
      expectedValue: 'y',
    },
  ];

  tests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program).not.toBeNull;
    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    testLetStatement(stmt, tt.expectedIdentifier);

    const letStmt = stmt as LetStatement;
    const val = letStmt.value;
    testLiteralExpression(val, tt.expectedValue);
  });
});

test('return statement', () => {
  const tests: Array<{
    input: string;
    expectedValue: string | boolean | number;
  }> = [
    { input: 'return 5', expectedValue: 5 },
    { input: 'return true', expectedValue: true },
    { input: 'return foobar', expectedValue: 'foobar' },
  ];
  tests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    const returnStmt = stmt as ReturnStatement;
    expect(returnStmt.tokenLiteral()).toBe('return');
    testLiteralExpression(returnStmt.returnValue, tt.expectedValue);
  });
});

test('identifier expression', () => {
  const input = 'foobar;';

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.constructor).toBe(ExpressionStatement);

  const ident = stmt.expression as Identifier;
  expect(ident.constructor).toBe(Identifier);
  expect(ident.value).toBe('foobar');
  expect(ident.tokenLiteral()).toBe('foobar');
});

test('integer literal expression', () => {
  const input = '5;';

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.constructor).toBe(ExpressionStatement);

  const literal = stmt.expression as IntegerLiteral;
  expect(literal.constructor).toBe(IntegerLiteral);
  expect(literal.value).toBe(5);
  expect(literal.tokenLiteral()).toBe('5');
});

test('parsing prefix expression', () => {
  const prefixTests: Array<{
    input: string;
    operator: string;
    value: number | string | boolean;
  }> = [
    { input: '!5;', operator: '!', value: 5 },
    { input: '-15;', operator: '-', value: 15 },
    { input: '!foobar;', operator: '!', value: 'foobar' },
    { input: '-foobar;', operator: '-', value: 'foobar' },
    { input: '!true;', operator: '!', value: true },
    { input: '!false;', operator: '!', value: false },
  ];

  prefixTests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt.constructor).toBe(ExpressionStatement);

    const exp = stmt.expression as PrefixExpression;
    expect(exp.constructor).toBe(PrefixExpression);
    expect(exp.operator).toBe(tt.operator);
    testLiteralExpression(exp.right, tt.value);
  });
});

test('parsing infix expression', () => {
  const infixTests: Array<{
    input: string;
    leftValue: number | string | boolean;
    operator: string;
    rightValue: number | string | boolean;
  }> = [
    { input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5 },
    { input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5 },
    { input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5 },
    { input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5 },
    { input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5 },
    { input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5 },
    { input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5 },
    { input: '5 != 5;', leftValue: 5, operator: '!=', rightValue: 5 },
    {
      input: 'foobar + barfoo;',
      leftValue: 'foobar',
      operator: '+',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar - barfoo;',
      leftValue: 'foobar',
      operator: '-',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar * barfoo;',
      leftValue: 'foobar',
      operator: '*',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar / barfoo;',
      leftValue: 'foobar',
      operator: '/',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar > barfoo;',
      leftValue: 'foobar',
      operator: '>',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar < barfoo;',
      leftValue: 'foobar',
      operator: '<',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar == barfoo;',
      leftValue: 'foobar',
      operator: '==',
      rightValue: 'barfoo',
    },
    {
      input: 'foobar != barfoo;',
      leftValue: 'foobar',
      operator: '!=',
      rightValue: 'barfoo',
    },
    {
      input: 'true == true',
      leftValue: true,
      operator: '==',
      rightValue: true,
    },
    {
      input: 'true != false',
      leftValue: true,
      operator: '!=',
      rightValue: false,
    },
    {
      input: 'false == false',
      leftValue: false,
      operator: '==',
      rightValue: false,
    },
  ];
  infixTests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt.constructor).toBe(ExpressionStatement);

    const exp = stmt.expression as InfixExpression;
    testInfixExpression(exp, tt.leftValue, tt.operator, tt.rightValue);
  });
});

test('operator precedence parsing', () => {
  const tests: Array<{
    input: string;
    expected: string;
  }> = [
    {
      input: '-a * b',
      expected: '((-a) * b)',
    },
    {
      input: '!-a',
      expected: '(!(-a))',
    },
    {
      input: 'a + b + c',
      expected: '((a + b) + c)',
    },
    {
      input: 'a + b - c',
      expected: '((a + b) - c)',
    },
    {
      input: 'a * b * c',
      expected: '((a * b) * c)',
    },
    {
      input: 'a * b / c',
      expected: '((a * b) / c)',
    },
    {
      input: 'a + b / c',
      expected: '(a + (b / c))',
    },
    {
      input: 'a + b * c + d / e - f',
      expected: '(((a + (b * c)) + (d / e)) - f)',
    },
    {
      input: '3 + 4; -5 * 5',
      expected: '(3 + 4)((-5) * 5)',
    },
    {
      input: '5 > 4 == 3 < 4',
      expected: '((5 > 4) == (3 < 4))',
    },
    {
      input: '5 < 4 != 3 > 4',
      expected: '((5 < 4) != (3 > 4))',
    },
    {
      input: '3 + 4 * 5 == 3 * 1 + 4 * 5',
      expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
    },
    {
      input: 'true',
      expected: 'true',
    },
    {
      input: 'false',
      expected: 'false',
    },
    {
      input: '1 + (2 + 3) + 4',
      expected: '((1 + (2 + 3)) + 4)',
    },
    {
      input: '(5 + 5) * 2',
      expected: '((5 + 5) * 2)',
    },
    {
      input: '2 / (5 + 5)',
      expected: '(2 / (5 + 5))',
    },
    {
      input: '(5 + 5) * 2 * (5 + 5)',
      expected: '(((5 + 5) * 2) * (5 + 5))',
    },
    {
      input: '-(5 + 5)',
      expected: '(-(5 + 5))',
    },
    {
      input: '!(true == true)',
      expected: '(!(true == true))',
    },
    {
      input: 'a + add(b * c) + d',
      expected: '((a + add((b * c))) + d)',
    },
    {
      input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))',
      expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
    },
    {
      input: 'add(a + b + c * d / f + g)',
      expected: 'add((((a + b) + ((c * d) / f)) + g))',
    },
  ];
  tests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    const actual = program.toString();
    expect(actual).toBe(tt.expected);
  });
});

test('boolean expression', () => {
  const tests: Array<{
    input: string;
    expectedBoolean: boolean;
  }> = [
    { input: 'true;', expectedBoolean: true },
    { input: 'false;', expectedBoolean: false },
  ];

  tests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0] as ExpressionStatement;
    expect(stmt.constructor).toBe(ExpressionStatement);

    const bool = stmt.expression as Bool;
    expect(bool.constructor).toBe(Bool);
    expect(bool.value).toBe(tt.expectedBoolean);
  });
});

test('if expression', () => {
  const input = 'if (x < y) { x }';

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.constructor).toBe(ExpressionStatement);

  const exp = stmt.expression as IfExpression;
  expect(exp.constructor).toBe(IfExpression);
  testInfixExpression(exp.condition, 'x', '<', 'y');

  expect(exp.consequence.statements.length).toBe(1);
  const consequence = exp.consequence.statements[0] as ExpressionStatement;
  expect(consequence.constructor).toBe(ExpressionStatement);
  testIdentifier(consequence.expression, 'x');
  expect(exp.alternative).toBe(undefined);
});

test('if else expression', () => {
  const input = 'if (x < y) { x } else { y }';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.constructor).toBe(ExpressionStatement);

  const exp = stmt.expression as IfExpression;
  expect(exp.constructor).toBe(IfExpression);
  testInfixExpression(exp.condition, 'x', '<', 'y');

  expect(exp.consequence.statements.length).toBe(1);
  const consequence = exp.consequence.statements[0] as ExpressionStatement;
  expect(consequence.constructor).toBe(ExpressionStatement);
  testIdentifier(consequence.expression, 'x');

  expect(exp.alternative.statements.length).toBe(1);
  const alternative = exp.alternative.statements[0] as ExpressionStatement;
  expect(alternative.constructor).toBe(ExpressionStatement);
  testIdentifier(alternative.expression, 'y');
});

test('function literal parsing', () => {
  const input = 'fn(x, y) { x + y; }';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.constructor).toBe(ExpressionStatement);

  const func = stmt.expression as FunctionLiteral;
  expect(func.constructor).toBe(FunctionLiteral);
  expect(func.parameters.length).toBe(2);
  testLiteralExpression(func.parameters[0], 'x');
  testLiteralExpression(func.parameters[1], 'y');

  expect(func.body.statements.length).toBe(1);
  const bodyStmt = func.body.statements[0] as ExpressionStatement;
  expect(bodyStmt.constructor).toBe(ExpressionStatement);
  testInfixExpression(bodyStmt.expression, 'x', '+', 'y');
});

test('function parameter parsing', () => {
  const tests: Array<{
    input: string;
    expectedParams: string[];
  }> = [
    { input: 'fn() {};', expectedParams: [] },
    { input: 'fn(x) {};', expectedParams: ['x'] },
    { input: 'fn(x, y, z) {};', expectedParams: ['x', 'y', 'z'] },
  ];

  tests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    const stmt = program.statements[0] as ExpressionStatement;
    const func = stmt.expression as FunctionLiteral;
    expect(func.parameters.length).toBe(tt.expectedParams.length);
    tt.expectedParams.forEach((ident, i) => {
      testLiteralExpression(func.parameters[i], ident);
    });
  });
});

test('call expression parsing', () => {
  const input = 'add(1, 2 * 3, 4 + 5);';
  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(1);
  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt.constructor).toBe(ExpressionStatement);

  const exp = stmt.expression as CallExpression;
  expect(exp.constructor).toBe(CallExpression);
  testIdentifier(exp.func, 'add');
  expect(exp.arguments.length).toBe(3);
  testLiteralExpression(exp.arguments[0], 1);
  testInfixExpression(exp.arguments[1], 2, '*', 3);
  testInfixExpression(exp.arguments[2], 4, '+', 5);
});

const testLetStatement = (s: Statement, name: string): void => {
  expect(s.tokenLiteral()).toBe('let');
  const letStmt = s as LetStatement;
  expect(letStmt.constructor).toBe(LetStatement);
  expect(letStmt.name.value).toBe(name);
  expect(letStmt.name.tokenLiteral()).toBe(name);
};

const testInfixExpression = (
  exp: Expression | undefined,
  left: number | string | boolean,
  operator: string,
  right: number | string | boolean
): void => {
  const opExp = exp as InfixExpression;
  expect(opExp.constructor).toBe(InfixExpression);
  testLiteralExpression(opExp.left, left);

  expect(opExp.operator).toBe(operator);
  testLiteralExpression(opExp.right, right);
};

const testLiteralExpression = (
  exp: Expression | undefined,
  expected: number | string | boolean
): void => {
  switch (typeof expected) {
    case 'number':
      testIntegerLiteral(exp, expected as number);
      break;
    case 'string':
      testIdentifier(exp, expected as string);
      break;
    case 'boolean':
      testBooleanLiteral(exp, expected as boolean);
      break;
    default:
      throw new Error(`type of exp not handled. got=${exp}`);
  }
};

const testIntegerLiteral = (
  il: Expression | undefined,
  value: number
): void => {
  const integ = il as IntegerLiteral;
  expect(integ.constructor).toBe(IntegerLiteral);
  expect(integ.value).toBe(value);
  expect(integ.tokenLiteral()).toBe(value.toString());
};

const testIdentifier = (exp: Expression | undefined, value: string): void => {
  const ident = exp as Identifier;
  expect(ident.constructor).toBe(Identifier);
  expect(ident.value).toBe(value);
  expect(ident.tokenLiteral()).toBe(value);
};

const testBooleanLiteral = (
  exp: Expression | undefined,
  value: boolean
): void => {
  const bo = exp as Bool;
  expect(bo.constructor).toBe(Bool);

  expect(bo.value).toBe(value);
  expect(bo.tokenLiteral()).toBe(value.toString());
};

const checkParserErrors = (p: Parser): void => {
  const errors = p.errors;
  if (errors.length === 0) {
    return;
  }
  errors.forEach((msg) => {
    console.log(`parser error: ${msg}`);
  });
  expect(errors.length).toBe(0);
};
