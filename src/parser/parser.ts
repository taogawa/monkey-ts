import { LetStatement, Statement, Program, Identifier } from '../ast/ast';
import { Lexer } from '../lexer/lexer';
import { Token, TokenType, TokenTypes } from '../token/token';

export class Parser {
  private l: Lexer;
  private curToken!: Token;
  private peekToken!: Token;
  errors: string[];

  constructor(l: Lexer) {
    this.l = l;
    this.errors = [];
    this.nextToken();
    this.nextToken();
  }

  peekError(t: TokenType): void {
    const msg = `expected next token to be ${t}, got ${this.peekToken.type} instead`;
    this.errors.push(msg);
  }

  nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  curTokenIs(t: TokenType): boolean {
    return this.curToken.type === t;
  }

  peekTokenIs(t: TokenType): boolean {
    return this.peekToken.type === t;
  }

  expectPeek(t: TokenType): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }

  parseProgram(): Program {
    const program = new Program();

    while (this.curToken.type !== TokenTypes.EOF) {
      const stmt = this.parseStatement();
      if (stmt != null) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }
    return program;
  }

  parseStatement(): Statement | undefined {
    switch (this.curToken.type) {
      case TokenTypes.LET:
        return this.parseLetStatement();
      default:
        return undefined;
    }
  }

  parseLetStatement(): LetStatement | undefined {
    const stmt = new LetStatement(this.curToken);
    if (!this.expectPeek(TokenTypes.IDENT)) {
      return undefined;
    }
    stmt.name = new Identifier(this.curToken, this.curToken.literal);
    if (!this.expectPeek(TokenTypes.ASSIGN)) {
      return undefined;
    }
    while (!this.curTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }
}
