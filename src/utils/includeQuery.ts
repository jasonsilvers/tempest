// Turn this into an obj later???
export function getIncludesQueryArray<T>(include: T | T[]): T[] {
  if (Array.isArray(include)) {
    return include;
  } else {
    if (include) {
      return [include];
    }
    return [];
  }
}
