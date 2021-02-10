import {
  ExpressionStatement,
  Identifier,
  LetStatement,
  ReturnStatement,
  Statement,
  IntegerLiteral,
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

const testLetStatement = (s: Statement, name: string): void => {
  expect(s.tokenLiteral()).toBe('let');
  const letStmt = s as LetStatement;
  expect(letStmt.name.value).toBe(name);
  expect(letStmt.name.tokenLiteral()).toBe(name);
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
