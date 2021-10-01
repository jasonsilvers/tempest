// object to get common text for amount of days
const daysToString = {
  7: 'Weekly',
  14: 'Bi-Weekly',
  30: 'Monthly',
  31: 'Monthly',
  90: 'Quarter',
  180: 'Semi-Annual',
  365: 'Annual',
};

/* get the common text for number of days if exits else render '## days' */
export const getInterval = (interval: number) => daysToString[interval] ?? `${interval} days`;
