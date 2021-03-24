export type ObjectType = typeof ObjectTypes[keyof typeof ObjectTypes];

export const ObjectTypes = {
  NULL_OBJ: 'NULL',
  INTEGER_OBJ: 'INTEGER',
  BOOLEAN_OBJ: 'BOOLEAN',
  RETURN_VALUE_OBJ: 'RETURN_VALUE',
};

export type BaseObject = {
  type(): ObjectType;
  inspect(): string;
};

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
