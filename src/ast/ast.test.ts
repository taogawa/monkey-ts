import { Token, TokenTypes } from '../token/token';
import { Program, LetStatement, Identifier } from './ast';

test('toString', () => {
  const program = new Program();
  const letStatement = new LetStatement(new Token(TokenTypes.LET, 'let'));
  letStatement.name = new Identifier(
    new Token(TokenTypes.IDENT, 'myVar'),
    'myVar'
  );
  letStatement.value = new Identifier(
    new Token(TokenTypes.IDENT, 'anotherVar'),
    'anotherVar'
  );
  program.statements.push(letStatement);
  expect(program.toString()).toBe('let myVar = anotherVar;');
});
