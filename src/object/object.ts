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
  HASH_OBJ: 'HASH',
};

export type BaseObject = {
  type(): ObjectType;
  inspect(): string;
};

type BuiltinFunction = (...args: BaseObject[]) => BaseObject;

export class HashPair {
  public constructor(public key: BaseObject, public value: BaseObject) {}
}

export type Hashable = BaseObject & {
  hashKey(): string;
};

export class IntegerObject implements Hashable {
  constructor(public value: number) {}

  type(): ObjectType {
    return ObjectTypes.INTEGER_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }

  hashKey(): string {
    return `${this.type()}#${this.value}`;
  }
}

export class BooleanObject implements Hashable {
  constructor(public value: boolean) {}

  type(): ObjectType {
    return ObjectTypes.BOOLEAN_OBJ;
  }

  inspect(): string {
    return this.value.toString();
  }

  hashKey(): string {
    return `${this.type()}#${this.value ? 1 : 0}`;
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

export class StringObject implements Hashable {
  constructor(public value: string) {}

  type(): ObjectType {
    return ObjectTypes.STRING_OBJ;
  }

  inspect(): string {
    return this.value;
  }

  hashKey(): string {
    let hash = 0;
    for (let i = 0; i < this.value.length; i++) {
      hash = hash * 31 + this.value.charCodeAt(i);
      hash = hash | 0;
    }
    return `${this.type}#${hash}`;
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

export class HashObject implements BaseObject {
  constructor(public pairs: Map<string, HashPair>) {}

  type(): ObjectType {
    return ObjectTypes.HASH_OBJ;
  }

  inspect(): string {
    const pairs: string[] = [];
    this.pairs.forEach((value, key) => {
      pairs.push(`${key.toString()}:${value.toString()}`);
    });
    return `{${pairs.join(', ')}]}`;
  }
}
