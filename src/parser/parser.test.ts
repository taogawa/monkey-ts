import { LetStatement, Statement } from '../ast/ast';
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
