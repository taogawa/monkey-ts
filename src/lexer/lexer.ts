import { Token, TokenTypes } from '../token/token';

export class Lexer {
  private static readonly LETTER_REGEX = /^[a-zA-Z_]$/;
  private static readonly WHITESPACE_REGEX = /^(\s|\\t|\\n|\\r)$/;
  private static readonly NUMBER_REGEX = /^[0-9]$/;
  private input: string;
  private position = 0;
  private readPosition = 0;
  private ch = '';

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = '';
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  nextToken(): Token {
    let tok: Token;
    this.skipWhitespace();
    switch (this.ch) {
      case '=':
        tok = new Token(TokenTypes.ASSIGN, this.ch);
        break;
      case ';':
        tok = new Token(TokenTypes.SEMICOLON, this.ch);
        break;
      case '(':
        tok = new Token(TokenTypes.LPAREN, this.ch);
        break;
      case ')':
        tok = new Token(TokenTypes.RPAREN, this.ch);
        break;
      case ',':
        tok = new Token(TokenTypes.COMMA, this.ch);
        break;
      case '+':
        tok = new Token(TokenTypes.PLUS, this.ch);
        break;
      case '{':
        tok = new Token(TokenTypes.LBRACE, this.ch);
        break;
      case '}':
        tok = new Token(TokenTypes.RBRACE, this.ch);
        break;
      case '':
        tok = new Token(TokenTypes.EOF, '');
        break;
      default:
        if (this.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          const tokenType = Token.lookupIdent(literal);
          tok = new Token(tokenType, literal);
          return tok;
        } else if (this.isDigit(this.ch)) {
          const tokenType = TokenTypes.INT;
          const literal = this.readNumber();
          tok = new Token(tokenType, literal);
          return tok;
        } else {
          tok = new Token(TokenTypes.ILLEGAL, this.ch);
        }
    }
    this.readChar();
    return tok;
  }

  readIdentifier(): string {
    const position = this.position;
    while (this.isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  readNumber(): string {
    const position = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  isLetter(ch: string): boolean {
    return Lexer.LETTER_REGEX.test(ch);
  }

  isDigit(ch: string): boolean {
    return Lexer.NUMBER_REGEX.test(ch);
  }

  skipWhitespace(): void {
    while (Lexer.WHITESPACE_REGEX.test(this.ch)) {
      this.readChar();
    }
  }
}
