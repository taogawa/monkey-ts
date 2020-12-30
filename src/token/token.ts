export type TokenType = typeof TokenTypes[keyof typeof TokenTypes];

export const TokenTypes = {
  ILLEGAL: 'ILLEGAL',
  EOF: 'EOF',

  // Identifiers + literals
  IDENT: 'IDENT', // add, foobar, x, y, ...
  INT: 'INT', // 1343456

  // Operators
  ASSIGN: '=',
  PLUS: '+',
  MINUS: '-',
  BANG: '!',
  ASTERISK: '*',
  SLASH: '/',

  LT: '<',
  GT: '>',

  EQ: '==',
  NOT_EQ: '!=',

  // Delimiters
  COMMA: ',',
  SEMICOLON: ';',

  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',

  // Keywords
  FUNCTION: 'FUNCTION',
  LET: 'LET',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  IF: 'IF',
  ELSE: 'ELSE',
  RETURN: 'RETURN',
} as const;

const Keywords: { [key: string]: TokenType } = {
  fn: TokenTypes.FUNCTION,
  let: TokenTypes.LET,
  true: TokenTypes.TRUE,
  false: TokenTypes.FALSE,
  if: TokenTypes.IF,
  else: TokenTypes.ELSE,
  return: TokenTypes.RETURN,
} as const;

export class Token {
  constructor(public type: TokenType, public literal: string) {}

  static lookupIdent(ident: string): TokenType {
    const tok = Keywords[ident];
    return tok ? tok : TokenTypes.IDENT;
  }
}
