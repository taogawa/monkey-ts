import {
  Bool,
  Node,
  Statement,
  Program,
  PrefixExpression,
  ExpressionStatement,
  IntegerLiteral,
} from '../ast/ast';
import {
  BaseObject,
  IntegerObject,
  BooleanObject,
  NullObject,
  ObjectTypes,
} from '../object/object';

const NULL = new NullObject();
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
    case PrefixExpression: {
      const exp = node as PrefixExpression;
      if (exp.right == null) {
        return undefined;
      }
      const right = evaluate(exp.right);
      if (right == null) {
        return undefined;
      }
      return evaluatePrefixExpression(exp.operator, right);
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

const evaluatePrefixExpression = (
  operator: string,
  right: BaseObject
): BaseObject => {
  switch (operator) {
    case '!': {
      return evaluateBangOperatorExpression(right);
    }
    case '-': {
      return evaluateMinusPrefixOperatorExpression(right);
    }
    default: {
      return NULL;
    }
  }
};

const evaluateBangOperatorExpression = (right: BaseObject): BaseObject => {
  switch (right) {
    case TRUE: {
      return FALSE;
    }
    case FALSE: {
      return TRUE;
    }
    case NULL: {
      return TRUE;
    }
    default: {
      return FALSE;
    }
  }
};

const evaluateMinusPrefixOperatorExpression = (
  right: BaseObject
): BaseObject => {
  if (right.type() != ObjectTypes.INTEGER_OBJ) {
    return NULL;
  }
  const intObj = right as IntegerObject;
  const value = intObj.value;
  return new IntegerObject(-value);
};
