import { describe, expect, it } from 'vitest';
import {
  formatNumberInput,
  formatTextInput,
  parseNumberInput,
} from './propInputValues';

describe('text prop inputs', () => {
  it('shows unset values as an empty field', () => {
    expect(formatTextInput(undefined)).toBe('');
    expect(formatTextInput(null)).toBe('');
    expect(formatTextInput('')).toBe('');
    expect(formatTextInput('hi')).toBe('hi');
  });
});

describe('number prop inputs', () => {
  it('treats an empty field as unset', () => {
    expect(parseNumberInput('')).toBeUndefined();
    expect(parseNumberInput('  ')).toBeUndefined();
  });

  it('parses numbers, including zero', () => {
    expect(parseNumberInput('0')).toBe(0);
    expect(parseNumberInput('-2.5')).toBe(-2.5);
    expect(parseNumberInput('abc')).toBeUndefined();
  });

  it('shows zero instead of blanking it', () => {
    expect(formatNumberInput(0)).toBe('0');
    expect(formatNumberInput(12)).toBe('12');
    expect(formatNumberInput(undefined)).toBe('');
    expect(formatNumberInput(Number.NaN)).toBe('');
  });
});
