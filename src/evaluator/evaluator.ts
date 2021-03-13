import {
  Node,
  Statement,
  Program,
  ExpressionStatement,
  IntegerLiteral,
} from '../ast/ast';
import { BaseObject, IntegerObject } from '../object/object';

export const evaluate = (node: Node): BaseObject | undefined => {
  switch (node.constructor) {
    case Program: {
      const program = node as Program;
      return evaluateStatements(program.statements);
    }
    case ExpressionStatement: {
      const stmt = node as ExpressionStatement;
      return stmt.expression != null ? evaluate(stmt.expression) : undefined;
    }
    case IntegerLiteral: {
      const il = node as IntegerLiteral;
      return new IntegerObject(il.value);
    }
  }
  return undefined;
};

const evaluateStatements = (
  stmts: Statement[]
): BaseObject | undefined => {
  let result: BaseObject | undefined;
  stmts.forEach((statement) => {
    const evaluated = evaluate(statement);
    if (evaluated != null) {
      result = evaluated;
    }
  });
  return result;
};
