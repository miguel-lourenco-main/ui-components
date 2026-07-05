import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildComponentScope, compileModule } from './moduleCompiler';

function Badge({ label, count }: { label: string; count?: number }) {
  return React.createElement('span', { className: 'badge' }, `${label}:${count ?? 0}`);
}

const scope = buildComponentScope('Badge', { default: Badge, Badge });

function render(component: React.ComponentType<any>): string {
  return renderToStaticMarkup(React.createElement(component));
}

describe('compileModule', () => {
  it('compiles a TSX module importing react and the playground component', () => {
    const result = compileModule(
      `import React from 'react';
import Badge from '@playground/component';

export default function Example() {
  return <div><Badge label="hits" count={3} /></div>;
}`,
      scope
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(render(result.Component)).toBe('<div><span class="badge">hits:3</span></div>');
    }
  });

  it('supports named imports and hooks', () => {
    const result = compileModule(
      `import { useState } from 'react';
import { Badge } from '@playground/component';

export default function Example() {
  const [count] = useState(7);
  return <Badge label="n" count={count} />;
}`,
      scope
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(render(result.Component)).toContain('n:7');
    }
  });

  it('works without a react import (classic pragma falls back to injected React)', () => {
    const result = compileModule(
      `import Badge from '@playground/component';
export default function Example() {
  return <Badge label="x" />;
}`,
      scope
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(render(result.Component)).toContain('x:0');
    }
  });

  it('resolves a named Example export when there is no default', () => {
    const result = compileModule(
      `import Badge from '@playground/component';
export function Example() {
  return <Badge label="named" />;
}`,
      scope
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(render(result.Component)).toContain('named:0');
    }
  });

  it('reports unknown imports with the available specifiers', () => {
    // The import must be used — the TypeScript preset elides unused imports.
    const result = compileModule(
      `import _ from 'lodash';
export default function Example() { return <div>{_.chunk([1], 1)}</div>; }`,
      scope
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('"lodash" is not available');
      expect(result.error.message).toContain("'@playground/component'");
    }
  });

  it('reports syntax errors with a location', () => {
    const result = compileModule('export default function Example() { return <div>; }', scope);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBeGreaterThanOrEqual(1);
    }
  });

  it('errors when nothing renderable is exported', () => {
    const result = compileModule('export const answer = 42;', scope);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('must export a component');
    }
  });
});
