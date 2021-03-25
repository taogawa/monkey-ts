import {
  Bool,
  Node,
  Program,
  BlockStatement,
  PrefixExpression,
  InfixExpression,
  ExpressionStatement,
  IntegerLiteral,
  IfExpression,
  ReturnStatement,
} from '../ast/ast';
import {
  BaseObject,
  IntegerObject,
  BooleanObject,
  NullObject,
  ObjectTypes,
  ReturnValue,
} from '../object/object';

const NULL = new NullObject();
const TRUE = new BooleanObject(true);
const FALSE = new BooleanObject(false);

export const evaluate = (node: Node): BaseObject | undefined => {
  switch (node.constructor) {
    case Program: {
      const program = node as Program;
      return evaluateProgram(program);
    }
    case BlockStatement: {
      const stmt = node as BlockStatement;
      return stmt != null ? evaluateBlockStatement(stmt) : undefined;
    }
    case ExpressionStatement: {
      const stmt = node as ExpressionStatement;
      return stmt.expression != null ? evaluate(stmt.expression) : undefined;
    }
    case ReturnStatement: {
      const rs = node as ReturnStatement;
      const val = evaluate(rs.returnValue);
      return val != null ? new ReturnValue(val) : undefined;
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
    case InfixExpression: {
      const exp = node as InfixExpression;
      if (exp.right == null) {
        return undefined;
      }
      const left = evaluate(exp.left);
      const right = evaluate(exp.right);
      return left != null && right != null
        ? evaluateInfixExpression(exp.operator, left, right)
        : undefined;
    }
    case IfExpression: {
      const ie = node as IfExpression;
      return ie != null ? evaluateIfExpression(ie) : undefined;
    }
  }
  return undefined;
};

const evaluateProgram = (program: Program): BaseObject | undefined => {
  let result: BaseObject | undefined;
  for (const statement of program.statements) {
    const evaluated = evaluate(statement);
    if (evaluated != null) {
      result = evaluated;
      if (result.constructor === ReturnValue) {
        return (result as ReturnValue).value;
      }
    }
  }
  return result;
};

const evaluateBlockStatement = (
  block: BlockStatement
): BaseObject | undefined => {
  let result: BaseObject | undefined;
  for (const statement of block.statements) {
    result = evaluate(statement);
    if (result != null && result.type() == ObjectTypes.RETURN_VALUE_OBJ) {
      return result;
    }
  }
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

const evaluateInfixExpression = (
  operator: string,
  left: BaseObject,
  right: BaseObject
): BaseObject => {
  if (
    left.type() == ObjectTypes.INTEGER_OBJ &&
    right.type() == ObjectTypes.INTEGER_OBJ
  ) {
    return evaluateIntegerInfixExpression(operator, left, right);
  } else if (operator === '==') {
    return nativeBoolToBooleanObject(left === right);
  } else if (operator === '!=') {
    return nativeBoolToBooleanObject(left !== right);
  } else {
    return NULL;
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

const evaluateIntegerInfixExpression = (
  operator: string,
  left: BaseObject,
  right: BaseObject
): BaseObject => {
  const leftVal = (left as IntegerObject).value;
  const rightVal = (right as IntegerObject).value;

  switch (operator) {
    case '+': {
      return new IntegerObject(leftVal + rightVal);
    }
    case '-': {
      return new IntegerObject(leftVal - rightVal);
    }
    case '*': {
      return new IntegerObject(leftVal * rightVal);
    }
    case '/': {
      return new IntegerObject(leftVal / rightVal);
    }
    case '<': {
      return nativeBoolToBooleanObject(leftVal < rightVal);
    }
    case '>': {
      return nativeBoolToBooleanObject(leftVal > rightVal);
    }
    case '==': {
      return nativeBoolToBooleanObject(leftVal == rightVal);
    }
    case '!=': {
      return nativeBoolToBooleanObject(leftVal != rightVal);
    }
    default: {
      return NULL;
    }
  }
};

const evaluateIfExpression = (ie: IfExpression): BaseObject | undefined => {
  const condition = evaluate(ie.condition);
  if (condition == null) {
    return undefined;
  } else if (isTruthy(condition)) {
    return evaluate(ie.consequence);
  } else if (ie.alternative != null) {
    return evaluate(ie.alternative);
  } else {
    return NULL;
  }
};

const isTruthy = (obj: BaseObject): boolean => {
  switch (obj) {
    case NULL: {
      return false;
    }
    case TRUE: {
      return true;
    }
    case FALSE: {
      return false;
    }
    default: {
      return true;
    }
  }
};
