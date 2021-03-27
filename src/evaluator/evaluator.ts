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
  Identifier,
  LetStatement,
} from '../ast/ast';
import {
  BaseObject,
  IntegerObject,
  BooleanObject,
  NullObject,
  ObjectTypes,
  ReturnValue,
  ErrorObject,
} from '../object/object';
import { Environment } from '../object/environment';

const NULL = new NullObject();
const TRUE = new BooleanObject(true);
const FALSE = new BooleanObject(false);

export const evaluate = (
  node: Node,
  env: Environment
): BaseObject | undefined => {
  switch (node.constructor) {
    case Program: {
      const program = node as Program;
      return evaluateProgram(program, env);
    }
    case BlockStatement: {
      const stmt = node as BlockStatement;
      return evaluateBlockStatement(stmt, env);
    }
    case ExpressionStatement: {
      const stmt = node as ExpressionStatement;
      return stmt.expression != null
        ? evaluate(stmt.expression, env)
        : undefined;
    }
    case ReturnStatement: {
      const rs = node as ReturnStatement;
      const val = evaluate(rs.returnValue, env);
      if (isError(val)) {
        return val;
      }
      return val != null ? new ReturnValue(val) : undefined;
    }
    case LetStatement: {
      const stmt = node as LetStatement;
      if (stmt.value == undefined) {
        return undefined;
      }
      const val = evaluate(stmt.value, env);
      if (isError(val)) {
        return val;
      } else if (val != null) {
        env.setStore(stmt.name.value, val);
      }
      break;
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
      const right = evaluate(exp.right, env);
      if (right == null) {
        return undefined;
      } else if (isError(right)) {
        return right;
      }
      return evaluatePrefixExpression(exp.operator, right);
    }
    case InfixExpression: {
      const exp = node as InfixExpression;
      if (exp.right == null) {
        return undefined;
      }
      const left = evaluate(exp.left, env);
      if (isError(left)) {
        return left;
      }
      const right = evaluate(exp.right, env);
      if (isError(right)) {
        return right;
      }
      return left != null && right != null
        ? evaluateInfixExpression(exp.operator, left, right)
        : undefined;
    }
    case IfExpression: {
      const ie = node as IfExpression;
      return evaluateIfExpression(ie, env);
    }
    case Identifier: {
      const ident = node as Identifier;
      return evaluateIdentifier(ident, env);
    }
  }
  return undefined;
};

const evaluateProgram = (
  program: Program,
  env: Environment
): BaseObject | undefined => {
  let result: BaseObject | undefined;
  for (const statement of program.statements) {
    const evaluated = evaluate(statement, env);
    if (evaluated != null) {
      result = evaluated;
      switch (result.constructor) {
        case ReturnValue: {
          return (result as ReturnValue).value;
        }
        case ErrorObject: {
          return result;
        }
      }
    }
  }
  return result;
};

const evaluateBlockStatement = (
  block: BlockStatement,
  env: Environment
): BaseObject | undefined => {
  let result: BaseObject | undefined;
  for (const statement of block.statements) {
    result = evaluate(statement, env);
    if (result != null) {
      const rt = result.type();
      if (rt === ObjectTypes.RETURN_VALUE_OBJ || rt === ObjectTypes.ERROR_OBJ) {
        return result;
      }
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
      return new ErrorObject(`unknown operator: ${operator} ${right.type()}`);
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
  } else if (left.type() !== right.type()) {
    return new ErrorObject(
      `type mismatch: ${left.type()} ${operator} ${right.type()}`
    );
  } else {
    return new ErrorObject(
      `unknown operator: ${left.type()} ${operator} ${right.type()}`
    );
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
    return new ErrorObject(`unknown operator: -${right.type()}`);
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
      return new ErrorObject(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`
      );
    }
  }
};

const evaluateIfExpression = (
  ie: IfExpression,
  env: Environment
): BaseObject | undefined => {
  const condition = evaluate(ie.condition, env);
  if (isError(condition)) {
    return condition;
  } else if (condition == null) {
    return undefined;
  } else if (isTruthy(condition)) {
    return evaluate(ie.consequence, env);
  } else if (ie.alternative != null) {
    return evaluate(ie.alternative, env);
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

const evaluateIdentifier = (node: Identifier, env: Environment): BaseObject => {
  const val = env.getStore(node.value);
  return val != null
    ? val
    : new ErrorObject(`identifier not found: ${node.value}`);
};

const isError = (obj: BaseObject | undefined): boolean => {
  if (obj != null) {
    return obj.type() === ObjectTypes.ERROR_OBJ;
  }
  return false;
};
