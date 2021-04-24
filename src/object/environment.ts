import { BaseObject } from '../object/object';

export class Environment {
  private store: { [key: string]: BaseObject };
  private outer!: Environment;

  constructor() {
    this.store = {};
  }

  getStore(name: string): BaseObject | undefined {
    const obj = this.store[name];
    if (obj == null && this.outer != null) {
      return this.outer.getStore(name);
    }
    return obj;
  }

  setStore(name: string, val: BaseObject): BaseObject {
    this.store[name] = val;
    return val;
  }

  static newEnclosedEnvironment(outer: Environment): Environment {
    const env = new Environment();
    env.outer = outer;
    return env;
  }
}
