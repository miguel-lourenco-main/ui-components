export function dummyUrl(domain: string = 'example.com', path: string = ''): string {
  return `https://${domain}${path || '/' + 'x'.repeat(5)}`;
}

export function dummyPhoneNumber(): string {
  return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

export function dummyUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function dummyColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

export function dummyImageUrl(width: number = 200, height: number = 200): string {
  return `https://via.placeholder.com/${width}x${height}`;
}

export function dummyJsonString(obj: any = { test: 'value' }): string {
  return JSON.stringify(obj);
}

export function dummyBase64(data: string = 'test'): string {
  return btoa(data);
}
