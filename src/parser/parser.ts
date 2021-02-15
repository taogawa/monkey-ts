import {
  ExpressionStatement,
  LetStatement,
  Statement,
  Program,
  Identifier,
  ReturnStatement,
  Expression,
  IntegerLiteral,
  PrefixExpression,
} from '../ast/ast';
import { Lexer } from '../lexer/lexer';
import { Token, TokenType, TokenTypes } from '../token/token';

const Precedences = {
  LOWEST: 1,
  EQUALS: 2, // ==
  LESSGREATER: 3, // > or <
  SUM: 4, // +
  PRODUCT: 5, // *
  PREFIX: 6, // -X or !X
  CALL: 7, // myFunction(X)
};

type PrefixParseFn = () => Expression | undefined;
type InfixParseFn = (expression: Expression) => Expression;

export class Parser {
  private l: Lexer;
  private curToken!: Token;
  private peekToken!: Token;
  errors: string[];
  prefixParseFns!: { [key in TokenType]?: PrefixParseFn };
  infixParseFns!: { [key in TokenType]?: InfixParseFn };

  constructor(l: Lexer) {
    this.l = l;
    this.errors = [];

    this.prefixParseFns = {};
    this.registerPrefix(TokenTypes.IDENT, this.parseIdentifier);
    this.registerPrefix(TokenTypes.INT, this.parseIntegerLiteral);
    this.registerPrefix(TokenTypes.BANG, this.parsePrefixExpression);
    this.registerPrefix(TokenTypes.MINUS, this.parsePrefixExpression);

    this.nextToken();
    this.nextToken();
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

  private peekError(t: TokenType): void {
    const msg = `expected next token to be ${t}, got ${this.peekToken.type} instead`;
    this.errors.push(msg);
  }

  private noPrefixParseFnError(t: TokenType): void {
    const msg = `no prefix parse function for ${t} found`;
    this.errors.push(msg);
  }

  private nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  private curTokenIs(t: TokenType): boolean {
    return this.curToken.type === t;
  }

  private peekTokenIs(t: TokenType): boolean {
    return this.peekToken.type === t;
  }

  private expectPeek(t: TokenType): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }

  private parseStatement(): Statement | undefined {
    switch (this.curToken.type) {
      case TokenTypes.LET:
        return this.parseLetStatement();
      case TokenTypes.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement | undefined {
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

  private parseReturnStatement(): ReturnStatement | undefined {
    const stmt = new ReturnStatement(this.curToken);
    this.nextToken();
    if (!this.curTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  private parseExpressionStatement(): ExpressionStatement {
    const stmt = new ExpressionStatement(this.curToken);
    stmt.expression = this.parseExpression(Precedences.LOWEST);

    if (this.peekTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  private parseExpression(precedence: number): Expression | undefined {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (prefix == null) {
      this.noPrefixParseFnError(this.curToken.type);
      return undefined;
    }
    const leftExp = prefix.call(this);
    return leftExp;
  }

  private parseIdentifier(): Expression {
    return new Identifier(this.curToken, this.curToken.literal);
  }

  private parseIntegerLiteral(): Expression | undefined {
    const value = parseInt(this.curToken.literal);
    if (isNaN(value)) {
      const msg = `could not parse ${this.curToken.literal} as integer`;
      this.errors.concat(msg);
      return undefined;
    }
    return new IntegerLiteral(this.curToken, value);
  }

  private parsePrefixExpression(): Expression {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.literal
    );
    this.nextToken();

    expression.right = this.parseExpression(Precedences.PREFIX);

    return expression;
  }

  private registerPrefix(tokenType: TokenType, fn: PrefixParseFn): void {
    this.prefixParseFns[tokenType] = fn;
  }

  private registerInfix(tokenType: TokenType, fn: InfixParseFn): void {
    this.infixParseFns[tokenType] = fn;
  }
}
