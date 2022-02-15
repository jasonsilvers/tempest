export const TrackingItemInterval = {
  365: 'Annually',
  180: 'Bi-Annually',
  90: 'Quarterly',
  30: 'Monthly',
  7: 'Weekly',
  0: 'One-Time',
};

/* get the common text for number of days if exits else render '## days' */
export const getInterval = (interval: number) => TrackingItemInterval[interval] ?? `${interval} days`;
