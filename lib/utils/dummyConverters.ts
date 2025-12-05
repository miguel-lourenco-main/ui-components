export function dummyToString(value: any): string {
  return String(value);
}

export function dummyToNumber(value: any): number {
  return Number(value);
}

export function dummyToBoolean(value: any): boolean {
  return Boolean(value);
}

export function dummyToInt(value: any): number {
  return parseInt(String(value), 10);
}

export function dummyToFloat(value: any): number {
  return parseFloat(String(value));
}

export function dummyToArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function dummyToObject(value: any): Record<string, any> {
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  return { value };
}

export function dummyToJson(value: any): string {
  return JSON.stringify(value);
}

export function dummyFromJson<T>(json: string): T {
  return JSON.parse(json);
}

export function dummyToBase64(value: string): string {
  return btoa(value);
}

export function dummyFromBase64(value: string): string {
  return atob(value);
}

export function dummyToUpperCase(value: string): string {
  return value.toUpperCase();
}

export function dummyToLowerCase(value: string): string {
  return value.toLowerCase();
}

export function dummyToCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export function dummyToKebabCase(value: string): string {
  return value.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function dummyToSnakeCase(value: string): string {
  return value.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function dummyToPascalCase(value: string): string {
  return value.replace(/(^\w|-\w)/g, (g) => g.replace(/-/, '').toUpperCase());
}

export function dummyToDate(value: string | number | Date): Date {
  return new Date(value);
}

export function dummyToTimestamp(value: Date | string | number): number {
  return new Date(value).getTime();
}
