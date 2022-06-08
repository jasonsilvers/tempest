import { Organization, PersonalProtectionEquipmentItem, Resource, Role, TrackingItem } from '@prisma/client';
import { Grants } from '../repositories/grantsRepo';
import { LogEventWithUser } from '../repositories/logRepo';
import { UserWithAll } from '../repositories/userRepo';

export type GroupedRank = { value: string; group: string };

export type UsersDTO = {
  users: UserWithAll[];
};

export type RolesDTO = {
  roles: Role[];
};

export type PPEItemsDTO = {
  ppeItems: PersonalProtectionEquipmentItem[];
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

export type LogEventDTO = {
  logEvents: LogEventWithUser[];
};

export type ResourceDTO = {
  resource: Resource[];
};
