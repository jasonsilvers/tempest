export function getToday(minus: number = 0) {
  const date = new Date();

  const monthShort = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate() - minus;
  const year = date.getFullYear();

  return `${monthShort} ${day}, ${year}`;
}
