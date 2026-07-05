import React from 'react';

/**
 * Compact inline error badge rendered in place of a function prop's output
 * when compiling or invoking the user's code fails.
 */
export function createErrorBadge(
  propName: string,
  error: unknown,
  label: string = 'Error'
): React.ReactElement {
  const message = error instanceof Error ? error.message : String(error);
  return React.createElement(
    'div',
    {
      className:
        'inline-flex items-center gap-1 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700',
      title: `Function Error: ${message}`,
      'data-testid': 'function-error-badge',
    },
    [
      React.createElement('span', { key: 'icon' }, '❌'),
      React.createElement('span', { key: 'name' }, propName),
      React.createElement('span', { key: 'error' }, label),
    ]
  );
}
