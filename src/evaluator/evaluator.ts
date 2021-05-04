import {
  Bool,
  Node,
  Program,
  BlockStatement,
  Expression,
  PrefixExpression,
  InfixExpression,
  ExpressionStatement,
  IntegerLiteral,
  IfExpression,
  ReturnStatement,
  Identifier,
  LetStatement,
  FunctionLiteral,
  CallExpression,
  StringLiteral,
} from '../ast/ast';
import {
  BaseObject,
  IntegerObject,
  BooleanObject,
  NullObject,
  ObjectTypes,
  ReturnValue,
  ErrorObject,
  FunctionObject,
  StringObject,
  Builtin,
} from '../object/object';
import { Environment } from '../object/environment';
import { Builtins } from './builtins';

const NULL = new NullObject();
const TRUE = new BooleanObject(true);
const FALSE = new BooleanObject(false);

export const evaluate = (node: Node, env: Environment): BaseObject => {
  if (node instanceof Program) {
    return evaluateProgram(node, env);
  } else if (node instanceof BlockStatement) {
    return evaluateBlockStatement(node, env);
  } else if (node instanceof ExpressionStatement) {
    return node.expression != null ? evaluate(node.expression, env) : NULL;
  } else if (node instanceof ReturnStatement) {
    const val = evaluate(node.returnValue, env);
    if (isError(val)) {
      return val;
    }
    return new ReturnValue(val);
  } else if (node instanceof LetStatement) {
    if (node.value == null) {
      return NULL;
    }
    const val = evaluate(node.value, env);
    if (isError(val)) {
      return val;
    }
    env.setStore(node.name.value, val);
  } else if (node instanceof IntegerLiteral) {
    return new IntegerObject(node.value);
  } else if (node instanceof StringLiteral) {
    return new StringObject(node.value);
  } else if (node instanceof Bool) {
    return nativeBoolToBooleanObject(node.value);
  } else if (node instanceof PrefixExpression) {
    if (node.right == null) {
      return NULL;
    }
    const right = evaluate(node.right, env);
    if (isError(right)) {
      return right;
    }
    return evaluatePrefixExpression(node.operator, right);
  } else if (node instanceof InfixExpression) {
    if (node.right == null) {
      return NULL;
    }
    const left = evaluate(node.left, env);
    if (isError(left)) {
      return left;
    }
    const right = evaluate(node.right, env);
    if (isError(right)) {
      return right;
    }
    return evaluateInfixExpression(node.operator, left, right);
  } else if (node instanceof IfExpression) {
    return evaluateIfExpression(node, env);
  } else if (node instanceof Identifier) {
    return evaluateIdentifier(node, env);
  } else if (node instanceof FunctionLiteral) {
    const params = node.parameters;
    const body = node.body;
    return new FunctionObject(params, body, env);
  } else if (node instanceof CallExpression) {
    const func = evaluate(node.func, env);
    if (isError(func)) {
      return func;
    }
    const args = evaluateExpressions(node.arguments, env);
    if (args.length === 1 && isError(args[0])) {
      return args[0];
    }
    return applyFunction(func, args);
  }
  return NULL;
};

const evaluateProgram = (program: Program, env: Environment): BaseObject => {
  let result: BaseObject = NULL;
  for (const statement of program.statements) {
    result = evaluate(statement, env);
    if (result instanceof ReturnValue) {
      return result.value;
    } else if (result instanceof ErrorObject) {
      return result;
    }
  }
  return result;
};

const evaluateBlockStatement = (
  block: BlockStatement,
  env: Environment
): BaseObject => {
  let result: BaseObject = NULL;
  for (const statement of block.statements) {
    result = evaluate(statement, env);
    const rt = result.type();
    if (rt === ObjectTypes.RETURN_VALUE_OBJ || rt === ObjectTypes.ERROR_OBJ) {
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
      return new ErrorObject(`unknown operator: ${operator} ${right.type()}`);
    }
  }
};

const evaluateInfixExpression = (
  operator: string,
  left: BaseObject,
  right: BaseObject
): BaseObject => {
  if (isIntegerObject(left) && isIntegerObject(right)) {
    return evaluateIntegerInfixExpression(operator, left, right);
  } else if (isStringObject(left) && isStringObject(right)) {
    return evaluateStringInfixExpression(operator, left, right);
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
  if (!isIntegerObject(right)) {
    return new ErrorObject(`unknown operator: -${right.type()}`);
  }
  const value = right.value;
  return new IntegerObject(-value);
};

const evaluateIntegerInfixExpression = (
  operator: string,
  left: IntegerObject,
  right: IntegerObject
): IntegerObject | BooleanObject | ErrorObject => {
  const leftVal = left.value;
  const rightVal = right.value;

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

const evaluateStringInfixExpression = (
  operator: string,
  left: StringObject,
  right: StringObject
): StringObject | ErrorObject => {
  if (operator !== '+') {
    return new ErrorObject(
      `unknown operator: ${left.type()} ${operator} ${right.type()}`
    );
  }

  const leftVal = (left as StringObject).value;
  const rightVal = (right as StringObject).value;
  return new StringObject(leftVal + rightVal);
};

const evaluateIfExpression = (
  ie: IfExpression,
  env: Environment
): BaseObject => {
  const condition = evaluate(ie.condition, env);
  if (isError(condition)) {
    return condition;
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
  if (val != null) {
    return val;
  } else if (Builtins[node.value]) {
    return Builtins[node.value];
  }
  return new ErrorObject(`identifier not found: ${node.value}`);
};

const evaluateExpressions = (
  exps: Expression[],
  env: Environment
): BaseObject[] => {
  const result: BaseObject[] = [];
  for (const e of exps) {
    const evaluated = evaluate(e, env);
    if (isError(evaluated)) {
      return [evaluated];
    }
    result.push(evaluated);
  }
  return result;
};

const applyFunction = (fn: BaseObject, args: BaseObject[]): BaseObject => {
  if (fn instanceof FunctionObject) {
    const extendedEnv = extendFunctionEnv(fn, args);
    const evaluated = evaluate(fn.body, extendedEnv);
    return unwrapReturnValue(evaluated);
  } else if (fn instanceof Builtin) {
    return fn.fn(...args);
  }
  return new ErrorObject(`not a function: ${fn.type()}`);
};

const extendFunctionEnv = (
  fn: FunctionObject,
  args: BaseObject[]
): Environment => {
  const env = Environment.newEnclosedEnvironment(fn.env);

  fn.parameters.forEach((param, paramIdx) => {
    env.setStore(param.value, args[paramIdx]);
  });
  return env;
};

const unwrapReturnValue = (obj: BaseObject): BaseObject => {
  if (obj instanceof ReturnValue) {
    return obj.value;
  }
  return obj;
};

const isError = (
  obj: BaseObject | undefined
): obj is ErrorObject | undefined => {
  if (obj != null) {
    return obj.type() === ObjectTypes.ERROR_OBJ;
  }
  return false;
};

const isIntegerObject = (obj: BaseObject): obj is IntegerObject => {
  return obj.type() === ObjectTypes.INTEGER_OBJ;
};

const isStringObject = (obj: BaseObject): obj is StringObject => {
  return obj.type() === ObjectTypes.STRING_OBJ;
};
