import {
  ExpressionStatement,
  Identifier,
  LetStatement,
  ReturnStatement,
  Statement,
  IntegerLiteral,
  PrefixExpression,
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
    integerValue: number;
  }> = [
    { input: '!5;', operator: '!', integerValue: 5 },
    { input: '-15;', operator: '-', integerValue: 15 },
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
    testIntegerLiteral(exp.right, tt.integerValue);
  });
});

const testLetStatement = (s: Statement, name: string): void => {
  expect(s.tokenLiteral()).toBe('let');
  const letStmt = s as LetStatement;
  expect(letStmt.constructor).toBe(LetStatement);
  expect(letStmt.name.value).toBe(name);
  expect(letStmt.name.tokenLiteral()).toBe(name);
};

const testIntegerLiteral = (il: Expression | undefined, value: number): void => {
  const integ = il as IntegerLiteral;
  expect(integ.constructor).toBe(IntegerLiteral);
  expect(integ.value).toBe(value);
  expect(integ.tokenLiteral()).toBe(value.toString());
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
