// Turn this into an obj later???
export function getIncludesQueryArray<T>(include: T | T[]): T[] {
  return Array.isArray(include) ? include : include !== undefined ? [include] : [];
}
