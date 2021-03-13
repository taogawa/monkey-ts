import {
  Bool,
  Node,
  Statement,
  Program,
  ExpressionStatement,
  IntegerLiteral,
} from '../ast/ast';
import { BaseObject, IntegerObject, BooleanObject } from '../object/object';

const TRUE = new BooleanObject(true);
const FALSE = new BooleanObject(false);

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
    case Bool: {
      const bool = node as Bool;
      return nativeBoolToBooleanObject(bool.value);
    }
  }
  return undefined;
};

const evaluateStatements = (stmts: Statement[]): BaseObject | undefined => {
  let result: BaseObject | undefined;
  stmts.forEach((statement) => {
    const evaluated = evaluate(statement);
    if (evaluated != null) {
      result = evaluated;
    }
  });
  return result;
};

const nativeBoolToBooleanObject = (input: boolean): BooleanObject => {
  if (input) {
    return TRUE;
  }
  return FALSE;
};
