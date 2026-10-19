import { describe, expect, it } from 'vitest';
import {
  hasVisualEffect,
  looksInitialOnly,
  nonVisualReason,
  partitionByVisualEffect,
} from './propPreview';

const visualProp = { name: 'label' };
const initialOnly = {
  name: 'defaultValue',
  preview: { visual: false as const, reason: 'Read once on mount.' },
};

describe('prop preview effect', () => {
  it('treats props without a preview contract as visual', () => {
    expect(hasVisualEffect(visualProp)).toBe(true);
    expect(nonVisualReason(visualProp)).toBeUndefined();
  });

  it('treats props marked visual:false as non-visual and exposes the reason', () => {
    expect(hasVisualEffect(initialOnly)).toBe(false);
    expect(nonVisualReason(initialOnly)).toBe('Read once on mount.');
  });

  it('partitions props and keeps their order', () => {
    const other = { name: 'aria-label', preview: { visual: false as const, reason: 'Screen readers only.' } };
    const { visual, nonVisual } = partitionByVisualEffect([visualProp, initialOnly, { name: 'size' }, other]);
    expect(visual.map((p) => p.name)).toEqual(['label', 'size']);
    expect(nonVisual.map((p) => p.name)).toEqual(['defaultValue', 'aria-label']);
  });

  it('recognises React initial-only prop names', () => {
    expect(looksInitialOnly('defaultValue')).toBe(true);
    expect(looksInitialOnly('defaultChecked')).toBe(true);
    expect(looksInitialOnly('default')).toBe(false);
    expect(looksInitialOnly('defaults')).toBe(false);
    expect(looksInitialOnly('value')).toBe(false);
  });
});
