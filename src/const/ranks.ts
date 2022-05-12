// can replace in future with api call to https://tron-common-api-il4.staging.dso.mil/api/v2/rank/USAF

import { GroupedRank } from '../types';

export const ranks: GroupedRank[] = [
  { value: 'AB/E-1', group: 'Enlisted' },
  { value: 'Amn/E-2', group: 'Enlisted' },
  { value: 'A1C/E-3', group: 'Enlisted' },
  { value: 'SrA/E-4', group: 'Enlisted' },
  { value: 'SSgt/E-5', group: 'Enlisted' },
  { value: 'TSgt/E-6', group: 'Enlisted' },
  { value: 'MSgt/E-7', group: 'Enlisted' },
  { value: 'SMSgt/E-8', group: 'Enlisted' },
  { value: 'CMSgt/E-9', group: 'Enlisted' },
  { value: '2nd Lt/O-1', group: 'Officer' },
  { value: '1st Lt/O-2', group: 'Officer' },
  { value: 'Capt/O-3', group: 'Officer' },
  { value: 'Maj/O-4', group: 'Officer' },
  { value: 'Lt Col/O-5', group: 'Officer' },
  { value: 'Col/O-6', group: 'Officer' },
  { value: 'Brig Gen/O-7', group: 'Officer' },
  { value: 'Maj Gen/O-8', group: 'Officer' },
  { value: 'Lt Gen/O-9', group: 'Officer' },
  { value: 'Civilian', group: 'Other' },
];
