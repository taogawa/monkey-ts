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
} from '../ast/ast';
import { Parser } from '../parser/parser';
import { Lexer } from '../lexer/lexer';

test('let statement', () => {
  const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`;

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program).not.toBeNull;
  expect(program.statements.length).toBe(3);

  const tests: Array<{
    expectedIdentifier: string;
  }> = [
    { expectedIdentifier: 'x' },
    { expectedIdentifier: 'y' },
    { expectedIdentifier: 'foobar' },
  ];

  tests.forEach((tt, i) => {
    const stmt = program.statements[i];
    testLetStatement(stmt, tt.expectedIdentifier);
  });
});

test('return statement', () => {
  const input = `
return 5;
return 10;
return 993322;
`;

  const l = new Lexer(input);
  const p = new Parser(l);
  const program = p.parseProgram();
  checkParserErrors(p);

  expect(program.statements.length).toBe(3);
  program.statements.forEach((stmt) => {
    const returnStatement = stmt as ReturnStatement;
    expect(returnStatement.tokenLiteral()).toBe('return');
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
    value: number | string;
  }> = [
    { input: '!5;', operator: '!', value: 5 },
    { input: '-15;', operator: '-', value: 15 },
    { input: '!foobar;', operator: '!', value: 'foobar' },
    { input: '-foobar;', operator: '-', value: 'foobar' },
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
    leftValue: number | string;
    operator: string;
    rightValue: number | string;
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

const testLetStatement = (s: Statement, name: string): void => {
  expect(s.tokenLiteral()).toBe('let');
  const letStmt = s as LetStatement;
  expect(letStmt.constructor).toBe(LetStatement);
  expect(letStmt.name.value).toBe(name);
  expect(letStmt.name.tokenLiteral()).toBe(name);
};

const testInfixExpression = (
  exp: Expression,
  left: number | string,
  operator: string,
  right: number | string
): void => {
  const opExp = exp as InfixExpression;
  expect(opExp.constructor).toBe(InfixExpression);
  testLiteralExpression(opExp.left, left);

  expect(opExp.operator).toBe(operator);
  testLiteralExpression(opExp.right, right);
};

const testLiteralExpression = (
  exp: Expression | undefined,
  expected: number | string
): void => {
  switch (typeof expected) {
    case 'number':
      testIntegerLiteral(exp, expected as number);
      break;
    case 'string':
      testIdentifier(exp, expected as string);
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
