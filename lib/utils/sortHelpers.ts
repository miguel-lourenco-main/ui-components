export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function sortByNested<T>(array: T[], path: string, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = getNestedValue(a, path);
    const bVal = getNestedValue(b, path);

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function sortByMultiple<T>(
  array: T[],
  sortKeys: Array<{ key: keyof T; order?: 'asc' | 'desc' }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { key, order = 'asc' } of sortKeys) {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

export function sortByFunction<T>(
  array: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  return [...array].sort(compareFn);
}

export function sortAlphabetically(array: string[], order: 'asc' | 'desc' = 'asc'): string[] {
  return [...array].sort((a, b) => {
    const comparison = a.localeCompare(b);
    return order === 'asc' ? comparison : -comparison;
  });
}

export function sortNumerically(array: number[], order: 'asc' | 'desc' = 'asc'): number[] {
  return [...array].sort((a, b) => {
    return order === 'asc' ? a - b : b - a;
  });
}

export function sortByDate(array: Date[], order: 'asc' | 'desc' = 'asc'): Date[] {
  return [...array].sort((a, b) => {
    const comparison = a.getTime() - b.getTime();
    return order === 'asc' ? comparison : -comparison;
  });
}

