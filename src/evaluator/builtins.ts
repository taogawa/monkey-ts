import {
  ArrayObject,
  BaseObject,
  Builtin,
  ErrorObject,
  IntegerObject,
  ObjectTypes,
  StringObject,
} from '../object/object';
import { NULL } from './evaluator';

export const Builtins: { [key: string]: Builtin } = {
  len: new Builtin(
    (...args: BaseObject[]): BaseObject => {
      if (args.length !== 1) {
        return new ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }
      const arg = args[0];
      if (arg instanceof ArrayObject) {
        return new IntegerObject(arg.elements.length);
      } else if (arg instanceof StringObject) {
        return new IntegerObject(arg.value.length);
      } else {
        return new ErrorObject(
          `argument to \`len\` not supported, got ${arg.type()}`
        );
      }
    }
  ),
  puts: new Builtin(
    (...args: BaseObject[]): BaseObject => {
      args.forEach((arg) => {
        console.log(arg.inspect());
      });
      return NULL;
    }
  ),
  first: new Builtin(
    (...args: BaseObject[]): BaseObject => {
      if (args.length !== 1) {
        return new ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }
      if (args[0].type() !== ObjectTypes.ARRAY_OBJ) {
        return new ErrorObject(
          `argument to \`first\` must be ARRAY, got ${args[0].type()}`
        );
      }
      const arr = args[0] as ArrayObject;
      if (arr.elements.length > 0) {
        return arr.elements[0];
      }

      return NULL;
    }
  ),
  last: new Builtin(
    (...args: BaseObject[]): BaseObject => {
      if (args.length !== 1) {
        return new ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }
      if (args[0].type() !== ObjectTypes.ARRAY_OBJ) {
        return new ErrorObject(
          `argument to \`last\` must be ARRAY, got ${args[0].type()}`
        );
      }
      const arr = args[0] as ArrayObject;
      const length = arr.elements.length;
      if (length > 0) {
        return arr.elements[length - 1];
      }

      return NULL;
    }
  ),
  rest: new Builtin(
    (...args: BaseObject[]): BaseObject => {
      if (args.length !== 1) {
        return new ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }
      if (args[0].type() !== ObjectTypes.ARRAY_OBJ) {
        return new ErrorObject(
          `argument to \`rest\` must be ARRAY, got ${args[0].type()}`
        );
      }
      const arr = args[0] as ArrayObject;
      const length = arr.elements.length;
      if (length > 0) {
        return new ArrayObject(arr.elements.slice(1, length - 1));
      }

      return NULL;
    }
  ),
  push: new Builtin(
    (...args: BaseObject[]): BaseObject => {
      if (args.length !== 2) {
        return new ErrorObject(
          `wrong number of arguments. got=${args.length}, want=2`
        );
      }
      if (args[0].type() !== ObjectTypes.ARRAY_OBJ) {
        return new ErrorObject(
          `argument to \`push\` must be ARRAY, got ${args[0].type()}`
        );
      }

      const arr = args[0] as ArrayObject;
      arr.elements.push(args[1]);
      return new ArrayObject(arr.elements);
    }
  ),
};
