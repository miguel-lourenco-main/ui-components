export function isString(value: unknown): value is string {
    return typeof value === 'string';
  }
  
  export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }
  
  export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }
  
  export function isObject(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  
  export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }
  
  export function isFunction(value: unknown): value is Function {
    return typeof value === 'function';
  }
  
  export function isNull(value: unknown): value is null {
    return value === null;
  }
  
  export function isUndefined(value: unknown): value is undefined {
    return value === undefined;
  }
  
  export function isNullOrUndefined(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }
  
  export function isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }
  
  export function isPromise<T = any>(value: unknown): value is Promise<T> {
    return (
      value !== null &&
      typeof value === 'object' &&
      'then' in value &&
      typeof (value as any).then === 'function'
    );
  }
  
  export function isPlainObject(value: unknown): value is Record<string, any> {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
  
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
  }
  
  export function getType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }  