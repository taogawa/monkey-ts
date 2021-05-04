import {
  BaseObject,
  Builtin,
  ErrorObject,
  IntegerObject,
  StringObject,
} from '../object/object';

export const Builtins: { [key: string]: Builtin } = {
  len: new Builtin(
    (...args: BaseObject[]): BaseObject => {
      if (args.length !== 1) {
        return new ErrorObject(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }
      const arg = args[0];
      if (arg instanceof StringObject) {
        return new IntegerObject(arg.value.length);
      } else {
        return new ErrorObject(
          `argument to \`len\` not supported, got ${arg.type()}`
        );
      }
    }
  ),
};
