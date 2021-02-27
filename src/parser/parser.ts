import {
  ExpressionStatement,
  LetStatement,
  Statement,
  Program,
  Identifier,
  Bool,
  ReturnStatement,
  Expression,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
} from '../ast/ast';
import { Lexer } from '../lexer/lexer';
import { Token, TokenType, TokenTypes } from '../token/token';

const enum Precedences {
  LOWEST = 1,
  EQUALS, // ==
  LESSGREATER, // > or <
  SUM, // +
  PRODUCT, // *
  PREFIX, // -X or !X
  CALL, // myFunction(X)
}

const OperatorPrecedences: { [key in TokenType]?: Precedences } = {
  [TokenTypes.EQ]: Precedences.EQUALS,
  [TokenTypes.NOT_EQ]: Precedences.EQUALS,
  [TokenTypes.LT]: Precedences.LESSGREATER,
  [TokenTypes.GT]: Precedences.LESSGREATER,
  [TokenTypes.PLUS]: Precedences.SUM,
  [TokenTypes.MINUS]: Precedences.SUM,
  [TokenTypes.SLASH]: Precedences.PRODUCT,
  [TokenTypes.ASTERISK]: Precedences.PRODUCT,
  [TokenTypes.LPAREN]: Precedences.CALL,
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
    this.registerPrefix(TokenTypes.TRUE, this.parseBool);
    this.registerPrefix(TokenTypes.FALSE, this.parseBool);
    this.registerPrefix(TokenTypes.LPAREN, this.parseGroupedExpression);

    this.infixParseFns = {};
    this.registerInfix(TokenTypes.PLUS, this.parseInfixExpression);
    this.registerInfix(TokenTypes.MINUS, this.parseInfixExpression);
    this.registerInfix(TokenTypes.SLASH, this.parseInfixExpression);
    this.registerInfix(TokenTypes.ASTERISK, this.parseInfixExpression);
    this.registerInfix(TokenTypes.EQ, this.parseInfixExpression);
    this.registerInfix(TokenTypes.NOT_EQ, this.parseInfixExpression);
    this.registerInfix(TokenTypes.LT, this.parseInfixExpression);
    this.registerInfix(TokenTypes.GT, this.parseInfixExpression);

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

  private peekPrecedence(): number {
    const p = OperatorPrecedences[this.peekToken.type];
    return p != null ? p : Precedences.LOWEST;
  }

  private curPrecedence(): number {
    const p = OperatorPrecedences[this.curToken.type];
    return p != null ? p : Precedences.LOWEST;
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
    let leftExp = prefix.call(this);
    while (
      !this.peekTokenIs(TokenTypes.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParseFns[this.peekToken.type];
      if (infix == null) {
        return leftExp;
      }

      this.nextToken();
      leftExp = infix.call(this, leftExp!); // eslint-disable-line
    }
    return leftExp;
  }

  private parseIdentifier(): Expression {
    return new Identifier(this.curToken, this.curToken.literal);
  }

  private parseBool(): Expression {
    return new Bool(this.curToken, this.curTokenIs(TokenTypes.TRUE));
  }

  private parseGroupedExpression(): Expression | undefined {
    this.nextToken();
    const exp = this.parseExpression(Precedences.LOWEST);
    return this.expectPeek(TokenTypes.RPAREN) ? exp : undefined;
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

  private parseInfixExpression(left: Expression): Expression {
    const expression = new InfixExpression(
      this.curToken,
      this.curToken.literal,
      left
    );
    const precedence = this.curPrecedence();
    this.nextToken();
    expression.right = this.parseExpression(precedence);

    return expression;
  }

  private registerPrefix(tokenType: TokenType, fn: PrefixParseFn): void {
    this.prefixParseFns[tokenType] = fn;
  }

  private registerInfix(tokenType: TokenType, fn: InfixParseFn): void {
    this.infixParseFns[tokenType] = fn;
  }
}
