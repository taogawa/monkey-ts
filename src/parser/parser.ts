import {
  BlockStatement,
  CallExpression,
  ExpressionStatement,
  FunctionLiteral,
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
  IfExpression,
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
    this.registerPrefix(TokenTypes.IF, this.parseIfExpression);
    this.registerPrefix(TokenTypes.FUNCTION, this.parseFunctionLiteral);

    this.infixParseFns = {};
    this.registerInfix(TokenTypes.PLUS, this.parseInfixExpression);
    this.registerInfix(TokenTypes.MINUS, this.parseInfixExpression);
    this.registerInfix(TokenTypes.SLASH, this.parseInfixExpression);
    this.registerInfix(TokenTypes.ASTERISK, this.parseInfixExpression);
    this.registerInfix(TokenTypes.EQ, this.parseInfixExpression);
    this.registerInfix(TokenTypes.NOT_EQ, this.parseInfixExpression);
    this.registerInfix(TokenTypes.LT, this.parseInfixExpression);
    this.registerInfix(TokenTypes.GT, this.parseInfixExpression);
    this.registerInfix(TokenTypes.LPAREN, this.parseCallExpression);

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
    this.nextToken();
    stmt.value = this.parseExpression(Precedences.LOWEST);
    while (this.peekTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  private parseReturnStatement(): ReturnStatement | undefined {
    const curToken = this.curToken;
    this.nextToken();
    const returnValue = this.parseExpression(Precedences.LOWEST);
    if (returnValue == null) {
      return undefined;
    }
    const stmt = new ReturnStatement(curToken, returnValue);
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
      leftExp = infix.call(this, leftExp!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
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

  private parseIfExpression(): Expression | undefined {
    if (!this.expectPeek(TokenTypes.LPAREN)) {
      return undefined;
    }
    this.nextToken();
    const condition = this.parseExpression(Precedences.LOWEST);
    if (condition == null) {
      return undefined;
    }
    const expression = new IfExpression(this.curToken, condition);

    if (!this.expectPeek(TokenTypes.RPAREN)) {
      return undefined;
    }

    if (!this.expectPeek(TokenTypes.LBRACE)) {
      return undefined;
    }

    expression.consequence = this.parseBlockStatement();

    if (this.peekTokenIs(TokenTypes.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(TokenTypes.LBRACE)) {
        return undefined;
      }

      expression.alternative = this.parseBlockStatement();
    }

    return expression;
  }

  private parseBlockStatement(): BlockStatement {
    const block = new BlockStatement(this.curToken);

    this.nextToken();

    while (
      !this.curTokenIs(TokenTypes.RBRACE) &&
      !this.curTokenIs(TokenTypes.EOF)
    ) {
      const stmt = this.parseStatement();
      if (stmt != undefined) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }
    return block;
  }

  private parseFunctionLiteral(): Expression | undefined {
    const lit = new FunctionLiteral(this.curToken);

    if (!this.expectPeek(TokenTypes.LPAREN)) {
      return undefined;
    }

    lit.parameters = this.parseFunctionParameters();

    if (!this.expectPeek(TokenTypes.LBRACE)) {
      return undefined;
    }

    lit.body = this.parseBlockStatement();

    return lit;
  }

  private parseFunctionParameters(): Identifier[] {
    const identifiers: Identifier[] = [];

    if (this.peekTokenIs(TokenTypes.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();

    const ident = new Identifier(this.curToken, this.curToken.literal);
    identifiers.push(ident);

    while (this.peekTokenIs(TokenTypes.COMMA)) {
      this.nextToken();
      this.nextToken();
      identifiers.push(new Identifier(this.curToken, this.curToken.literal));
    }

    if (!this.expectPeek(TokenTypes.RPAREN)) {
      return [];
    }

    return identifiers;
  }

  private parseCallExpression(func: Expression): Expression {
    const exp = new CallExpression(this.curToken, func);
    exp.arguments = this.parseCallArguments();
    return exp;
  }

  private parseCallArguments(): Expression[] {
    const args: Expression[] = [];

    if (this.peekTokenIs(TokenTypes.RPAREN)) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    const firstArgExp = this.parseExpression(Precedences.LOWEST);
    if (firstArgExp != null) {
      args.push(firstArgExp);
    }

    while (this.peekTokenIs(TokenTypes.COMMA)) {
      this.nextToken();
      this.nextToken();
      const argExp = this.parseExpression(Precedences.LOWEST);
      if (argExp != null) {
        args.push(argExp);
      }
    }

    if (!this.expectPeek(TokenTypes.RPAREN)) {
      return [];
    }

    return args;
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
