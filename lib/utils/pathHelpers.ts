export function joinPaths(...paths: string[]): string {
  return paths
    .map(path => path.replace(/^\/+|\/+$/g, ''))
    .filter(path => path.length > 0)
    .join('/');
}

export function normalizePath(path: string): string {
  return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

export function getPathSegments(path: string): string[] {
  return path.split('/').filter(segment => segment.length > 0);
}

export function getBasename(path: string, ext?: string): string {
  const segments = getPathSegments(path);
  const basename = segments[segments.length - 1] || '';
  
  if (ext && basename.endsWith(ext)) {
    return basename.slice(0, -ext.length);
  }
  
  return basename;
}

export function getDirname(path: string): string {
  const segments = getPathSegments(path);
  segments.pop();
  return segments.length > 0 ? '/' + segments.join('/') : '/';
}

export function getExtension(path: string): string {
  const basename = getBasename(path);
  const lastDot = basename.lastIndexOf('.');
  return lastDot > 0 ? basename.slice(lastDot) : '';
}

export function removeExtension(path: string): string {
  const ext = getExtension(path);
  return ext ? path.slice(0, -ext.length) : path;
}

export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/');
}

export function resolvePath(...paths: string[]): string {
  let resolved = '';
  
  for (let i = paths.length - 1; i >= 0; i--) {
    const path = paths[i];
    
    if (isAbsolutePath(path)) {
      resolved = path;
      continue;
    }
    
    resolved = joinPaths(path, resolved);
  }
  
  return normalizePath(resolved || '/');
}

export function relativePath(from: string, to: string): string {
  const fromSegments = getPathSegments(from);
  const toSegments = getPathSegments(to);
  
  let commonLength = 0;
  while (
    commonLength < fromSegments.length &&
    commonLength < toSegments.length &&
    fromSegments[commonLength] === toSegments[commonLength]
  ) {
    commonLength++;
  }
  
  const upLevels = fromSegments.length - commonLength;
  const downPath = toSegments.slice(commonLength).join('/');
  
  const upPath = '../'.repeat(upLevels);
  return normalizePath(upPath + downPath) || '.';
}

