declare module Chai {
  interface ChaiStatic {
    ajv: any;
  }
  interface Assertion {
    jsonSchema(object: any): void;
    ajv: any;
  }
}
