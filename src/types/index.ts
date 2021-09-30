import { Role, Organization, TrackingItem } from '@prisma/client';
import { Grants } from '../repositories/grantsRepo';
import { UserWithAll } from '../repositories/userRepo';

export type GroupedRank = { value: string; group: string };

export type UsersDTO = {
  users: UserWithAll[];
};

export type RolesDTO = {
  roles: Role[];
};

export type OrgsDTO = {
  organizations: Organization[];
};

export type GrantsDTO = {
  grants: Grants;
};

export type TrackingItemsDTO = {
  trackingItems: TrackingItem[];
};
