import { Organization } from '@prisma/client';
import { UserWithAll } from '../../repositories/userRepo';
import { EStatus } from './Enums';

export type StatusCounts = {
  All: number;
  Overdue: number;
  Upcoming: number;
  Done: number;
};

export type AllCounts = {
  All: number;
  Overdue: number;
  Upcoming: number;
  Done: number;
  [key: string]: StatusCounts | number;
};

export type UserCounts = Omit<StatusCounts, 'All'>;

export type Actions =
  | { type: 'filterByName'; nameFilter: string }
  | { type: 'clearName' }
  | { type: 'filterByStatus'; statusFilter: EStatus }
  | { type: 'clearStatus' }
  | { type: 'filterByOrganization'; organizationIdFilter: number }
  | { type: 'clearOrganization' }
  | { type: 'setUserList'; userList: UserWithAll[] }
  | { type: 'setOrganizationList'; Organizations: Organization[] }
  | { type: 'setCounts'; counts: StatusCounts };
