import { BlockStatement, Identifier } from 'ast/ast';
import { Environment } from './environment';

export type ObjectType = typeof ObjectTypes[keyof typeof ObjectTypes];

export const ObjectTypes = {
  NULL_OBJ: 'NULL',
  ERROR_OBJ: 'ERROR',
  INTEGER_OBJ: 'INTEGER',
  BOOLEAN_OBJ: 'BOOLEAN',
  STRING_OBJ: 'STRING',
  RETURN_VALUE_OBJ: 'RETURN_VALUE',
  FUNCTION_OBJ: 'FUNCTION',
  BUILTIN_OBJ: 'BUILTIN',
  ARRAY_OBJ: 'ARRAY',
};

export type BaseObject = {
  type(): ObjectType;
  inspect(): string;
};

type BuiltinFunction = (...args: BaseObject[]) => BaseObject;

export class IntegerObject implements BaseObject {
  constructor(public value: number) {}

  type(): ObjectType {
    return ObjectTypes.INTEGER_OBJ;
  }
  inspect(): string {
    return this.value.toString();
  }
}

export class BooleanObject implements BaseObject {
  constructor(public value: boolean) {}

  type(): ObjectType {
    return ObjectTypes.BOOLEAN_OBJ;
  }
  inspect(): string {
    return this.value.toString();
  }
}

export class NullObject implements BaseObject {
  type(): ObjectType {
    return ObjectTypes.NULL_OBJ;
  }
  inspect(): string {
    return 'null';
  }
}

export class ReturnValue implements BaseObject {
  constructor(public value: BaseObject) {}

  type(): ObjectType {
    return ObjectTypes.RETURN_VALUE_OBJ;
  }
  inspect(): string {
    return this.value.inspect();
  }
}

export class ErrorObject implements BaseObject {
  constructor(public message: string) {}

  type(): ObjectType {
    return ObjectTypes.ERROR_OBJ;
  }
  inspect(): string {
    return `ERROR: ${this.message}`;
  }
}

export class FunctionObject implements BaseObject {
  constructor(
    public parameters: Identifier[],
    public body: BlockStatement,
    public env: Environment
  ) {}

  type(): ObjectType {
    return ObjectTypes.FUNCTION_OBJ;
  }

  inspect(): string {
    return `fn(${this.parameters.join(', ')}) {\n${this.body.toString()}\n}`;
  }
}

export class StringObject implements BaseObject {
  constructor(public value: string) {}

  type(): ObjectType {
    return ObjectTypes.STRING_OBJ;
  }

  inspect(): string {
    return this.value;
  }
}

export class Builtin implements BaseObject {
  constructor(public fn: BuiltinFunction) {}

  type(): ObjectType {
    return ObjectTypes.BUILTIN_OBJ;
  }

  inspect(): string {
    return 'builtin function';
  }
}

export class ArrayObject implements BaseObject {
  constructor(public elements: BaseObject[]) {}

  type(): ObjectType {
    return ObjectTypes.ARRAY_OBJ;
  }

  inspect(): string {
    const elems: string[] = this.elements.map((p) => {
      return p.inspect();
    });
    return `[${elems.join(', ')}]`;
  }
}
