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
    return this.statements.join('');
  }
}

// Statements
export class LetStatement implements Statement {
  public value?: Expression;
  constructor(public token: Token, public name: Identifier) {}

  statementNode(): void {
    return;
  }

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
  constructor(public token: Token, public returnValue: Expression) {}

  statementNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} = ${
      this.returnValue != null ? this.returnValue : ''
    };`;
  }
}

export class ExpressionStatement implements Statement {
  expression?: Expression;
  constructor(public token: Token) {}

  statementNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.expression != null ? this.expression.toString() : '';
  }
}

export class BlockStatement implements Statement {
  public statements: Statement[];
  constructor(
    public token: Token // The { token
  ) {
    this.statements = [];
  }

  statementNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.statements.join('');
  }
}

// Expressions
export class Identifier implements Expression {
  constructor(
    public token: Token, // The TokenTypes.IDENT token
    public value: string
  ) {}

  expressionNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.value;
  }
}

export class Bool implements Expression {
  constructor(public token: Token, public value: boolean) {}

  expressionNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.token.literal;
  }
}

export class IntegerLiteral implements Expression {
  constructor(public token: Token, public value: number) {}

  expressionNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.token.literal;
  }
}

export class PrefixExpression implements Expression {
  right?: Expression;

  constructor(
    public token: Token, // The prefix token, e.g. !
    public operator: string
  ) {}

  expressionNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.operator}${this.right})`;
  }
}

export class InfixExpression implements Expression {
  right?: Expression;

  constructor(
    public token: Token, // The operator token, e.g. +
    public operator: string,
    public left: Expression
  ) {}

  expressionNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.left} ${this.operator} ${this.right})`;
  }
}

export class IfExpression implements Expression {
  public consequence!: BlockStatement;
  public alternative!: BlockStatement;

  constructor(
    public token: Token, // The 'if' token
    public condition: Expression
  ) {}

  expressionNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    let out = `if ${this.condition} ${this.consequence}`;
    if (this.alternative != null) {
      out += ` else ${this.alternative}`;
    }
    return out;
  }
}

export class FunctionLiteral implements Expression {
  parameters!: Identifier[];
  body!: BlockStatement;

  constructor(
    public token: Token // The 'fn' token
  ) {
    this.parameters = [];
  }

  expressionNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const params: string[] = this.parameters.map((p) => {
      return p.toString();
    });
    return `${this.tokenLiteral()}(${params.join(', ')})${this.body}`;
  }
}

export class CallExpression implements Expression {
  public arguments!: Expression[];
  constructor(
    public token: Token, // The '(' token
    public func: Expression // Identifier or FunctionLiteral
  ) {}

  expressionNode(): void {
    return;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.func}(${this.arguments.join(', ')})`;
  }
}
