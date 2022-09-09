export function getToday(minus: number = 0) {
  const date = new Date();

  const monthShort = date.toLocaleString('default', { month: 'short' });
  let day = date.getDate() - minus;

  if (day === 0) {
    day = 1
  }

  const year = date.getFullYear();

  return `${monthShort} ${day}, ${year}`;
}
