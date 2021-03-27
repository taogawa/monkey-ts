import { BaseObject } from '../object/object';

export class Environment {
  private store: { [key: string]: BaseObject };

  constructor() {
    this.store = {};
  }

  getStore(name: string): BaseObject | undefined {
    const obj = this.store[name];
    return obj;
  }

  setStore(name: string, val: BaseObject): BaseObject {
    this.store[name] = val;
    return val;
  }
}
