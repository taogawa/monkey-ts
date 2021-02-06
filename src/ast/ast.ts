import { Token } from 'token/token';

// The base Node interface
export type Node = {
  tokenLiteral(): string;
};

// All statement nodes implement this
export type Statement = Node & {
  statementNode(): void;
};

// All expression nodes implement this
export type Expression = Node & {
  expressionNode(): void;
};

export class Program implements Node {
  statements: Statement[];

  constructor() {
    this.statements = [];
  }

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return '';
    }
  }
}

// Statements
export class LetStatement implements Statement {
  name!: Identifier;
  value!: Expression;
  constructor(public token: Token) {
    this.token = token;
  }

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }
}

export class ReturnStatement implements Statement {
  returnValue!: Expression;
  constructor(public token: Token) {
    this.token = token;
  }

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }
}

// Expressions
export class Identifier implements Expression {
  constructor(public token: Token, public value: string) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  expressionNode(): void {}
}

export class ExpressionStatement implements Statement {
  expression!: Expression;
  constructor(public token: Token) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }
}
