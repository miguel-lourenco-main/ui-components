export function dummyString(length: number = 10): string {
  return 'x'.repeat(length);
}

export function dummyNumber(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function dummyBoolean(): boolean {
  return Math.random() >= 0.5;
}

export function dummyId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
}

export function dummyEmail(domain: string = 'test.com'): string {
  return `user_${Math.random().toString(36).substring(7)}@${domain}`;
}

export function dummyDate(daysOffset: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
}
