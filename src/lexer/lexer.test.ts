import { TokenType, TokenTypes } from '../token/token';
import { Lexer } from '../lexer/lexer';

test('next token', () => {
  const input = `let five = 5;
let ten = 10;

let add = fn(x, y) {
  x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 5;
`;
  const tests: Array<{
    expectedType: TokenType;
    expectedLiteral: string;
  }> = [
    { expectedType: TokenTypes.LET, expectedLiteral: 'let' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'five' },
    { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
    { expectedType: TokenTypes.INT, expectedLiteral: '5' },
    { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
    { expectedType: TokenTypes.LET, expectedLiteral: 'let' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'ten' },
    { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
    { expectedType: TokenTypes.INT, expectedLiteral: '10' },
    { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
    { expectedType: TokenTypes.LET, expectedLiteral: 'let' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'add' },
    { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
    { expectedType: TokenTypes.FUNCTION, expectedLiteral: 'fn' },
    { expectedType: TokenTypes.LPAREN, expectedLiteral: '(' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'x' },
    { expectedType: TokenTypes.COMMA, expectedLiteral: ',' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'y' },
    { expectedType: TokenTypes.RPAREN, expectedLiteral: ')' },
    { expectedType: TokenTypes.LBRACE, expectedLiteral: '{' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'x' },
    { expectedType: TokenTypes.PLUS, expectedLiteral: '+' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'y' },
    { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
    { expectedType: TokenTypes.RBRACE, expectedLiteral: '}' },
    { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
    { expectedType: TokenTypes.LET, expectedLiteral: 'let' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'result' },
    { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'add' },
    { expectedType: TokenTypes.LPAREN, expectedLiteral: '(' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'five' },
    { expectedType: TokenTypes.COMMA, expectedLiteral: ',' },
    { expectedType: TokenTypes.IDENT, expectedLiteral: 'ten' },
    { expectedType: TokenTypes.RPAREN, expectedLiteral: ')' },
    { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
    { expectedType: TokenTypes.BANG, expectedLiteral: '!' },
    { expectedType: TokenTypes.MINUS, expectedLiteral: '-' },
    { expectedType: TokenTypes.SLASH, expectedLiteral: '/' },
    { expectedType: TokenTypes.ASTERISK, expectedLiteral: '*' },
    { expectedType: TokenTypes.INT, expectedLiteral: '5' },
    { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
    { expectedType: TokenTypes.INT, expectedLiteral: '5' },
    { expectedType: TokenTypes.LT, expectedLiteral: '<' },
    { expectedType: TokenTypes.INT, expectedLiteral: '10' },
    { expectedType: TokenTypes.GT, expectedLiteral: '>' },
    { expectedType: TokenTypes.INT, expectedLiteral: '5' },
    { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
    { expectedType: TokenTypes.EOF, expectedLiteral: '' },
  ];
  const l = new Lexer(input);
  tests.forEach((tt) => {
    const tok = l.nextToken();
    expect(tok.type).toBe(tt.expectedType);
    expect(tok.literal).toBe(tt.expectedLiteral);
  });
});
