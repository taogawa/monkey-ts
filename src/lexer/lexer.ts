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

  nextToken(): Token {
    let tok: Token;
    this.skipWhitespace();
    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          const ch = this.ch;
          this.readChar();
          const literal = `${ch}${this.ch}`;
          tok = new Token(TokenTypes.EQ, literal);
        } else {
          tok = new Token(TokenTypes.ASSIGN, this.ch);
        }
        break;
      case ';':
        tok = new Token(TokenTypes.SEMICOLON, this.ch);
        break;
      case '+':
        tok = new Token(TokenTypes.PLUS, this.ch);
        break;
      case '-':
        tok = new Token(TokenTypes.MINUS, this.ch);
        break;
      case '!':
        if (this.peekChar() === '=') {
          const ch = this.ch;
          this.readChar();
          const literal = `${ch}${this.ch}`;
          tok = new Token(TokenTypes.NOT_EQ, literal);
        } else {
          tok = new Token(TokenTypes.BANG, this.ch);
        }
        break;
      case '*':
        tok = new Token(TokenTypes.ASTERISK, this.ch);
        break;
      case '/':
        tok = new Token(TokenTypes.SLASH, this.ch);
        break;
      case '<':
        tok = new Token(TokenTypes.LT, this.ch);
        break;
      case '>':
        tok = new Token(TokenTypes.GT, this.ch);
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
      case '{':
        tok = new Token(TokenTypes.LBRACE, this.ch);
        break;
      case '}':
        tok = new Token(TokenTypes.RBRACE, this.ch);
        break;
      case '"':
        tok = new Token(TokenTypes.STRING, this.readString());
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

  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = '';
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  private peekChar(): string {
    return this.readPosition >= this.input.length
      ? ''
      : this.input[this.readPosition];
  }

  private readIdentifier(): string {
    const position = this.position;
    while (this.isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  private readNumber(): string {
    const position = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  private readString(): string {
    const position = this.position + 1;
    do {
      this.readChar();
    } while (!(this.ch === '"' || this.ch === ''));
    return this.input.slice(position, this.position);
  }

  private isLetter(ch: string): boolean {
    return Lexer.LETTER_REGEX.test(ch);
  }

  private isDigit(ch: string): boolean {
    return Lexer.NUMBER_REGEX.test(ch);
  }

  private skipWhitespace(): void {
    while (Lexer.WHITESPACE_REGEX.test(this.ch)) {
      this.readChar();
    }
  }
}
