export function filterObject<Type, K extends keyof Type>(obj: Type, filter: K[]) {
  const copy = { ...obj };
  filter.forEach((key) => delete copy[key]);
  return copy;
}
