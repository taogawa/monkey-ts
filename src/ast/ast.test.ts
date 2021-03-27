import { Token, TokenTypes } from '../token/token';
import { Program, LetStatement, Identifier } from './ast';

test('toString', () => {
  const program = new Program();
  const ident = new Identifier(new Token(TokenTypes.IDENT, 'myVar'), 'myVar');
  const letStatement = new LetStatement(
    new Token(TokenTypes.LET, 'let'),
    ident
  );
  letStatement.value = new Identifier(
    new Token(TokenTypes.IDENT, 'anotherVar'),
    'anotherVar'
  );
  program.statements.push(letStatement);
  expect(program.toString()).toBe('let myVar = anotherVar;');
});
