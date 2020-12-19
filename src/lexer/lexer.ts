import { Token, TokenTypes } from "../token/token";
export class Lexer {
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
    switch (this.ch) {
      case '=':
        tok = new Token(TokenTypes.ASSIGN, this.ch)
        break;
      case ';':
        tok = new Token(TokenTypes.SEMICOLON, this.ch)
        break;
      case '(':
        tok = new Token(TokenTypes.LPAREN, this.ch)
        break;
      case ')':
        tok = new Token(TokenTypes.RPAREN, this.ch)
        break;
      case ',':
        tok = new Token(TokenTypes.COMMA, this.ch)
        break;
      case '+':
        tok = new Token(TokenTypes.PLUS, this.ch)
        break;
      case '{':
        tok = new Token(TokenTypes.LBRACE, this.ch)
        break;
      case '}':
        tok = new Token(TokenTypes.RBRACE, this.ch)
        break;
      case '':
        tok = new Token(TokenTypes.EOF, "")
        break;
      default: 
        tok = new Token(TokenTypes.ILLEGAL, "")
    }
    this.readChar();
    return tok;
  }
}
