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

  toString(): string {
    return this.statements.join();
  }
}

// Statements
export class LetStatement implements Statement {
  name!: Identifier;
  value!: Expression;
  constructor(public token: Token) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} ${this.name} = ${
      this.value != null ? this.value : ''
    };`;
  }
}

export class ReturnStatement implements Statement {
  returnValue!: Expression;
  constructor(public token: Token) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} = ${
      this.returnValue != null ? this.returnValue : ''
    };`;
  }
}

// Expressions
export class Identifier implements Expression {
  constructor(public token: Token, public value: string) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.value;
  }
}

export class ExpressionStatement implements Statement {
  expression!: Expression;
  constructor(public token: Token) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.expression != null ? this.expression.toString() : '';
  }
}
