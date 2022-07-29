import { Organization } from '@prisma/client';
import { LoggedInUser } from '../../src/repositories/userRepo';
import { determineOrgsWithCatalogs } from '../../src/utils/determineOrgsWithCatalogs';
import { andrewMonitor } from '../testutils/mocks/fixtures';

const organizations: Organization[] = [
  { id: 1, name: '15th Medical group', shortName: '15th mdg', parentId: null, types: ['CATALOG'] },
  { id: 2, name: 'organization 2', shortName: 'org 2', parentId: 1, types: [] },
  { id: 3, name: 'organization 3', shortName: 'org 3', parentId: 2, types: ['CATALOG'] },
  { id: 4, name: 'organization 4', shortName: 'org 4', parentId: 3, types: [] },
  { id: 5, name: 'organization 5', shortName: 'org 5', parentId: 2, types: [] },
];

test('should return users org if is type calalog and any children orgs that are type catalog', () => {
  const orgsWithCatalog = determineOrgsWithCatalogs(andrewMonitor, organizations);

  expect(orgsWithCatalog).toStrictEqual([
    { id: 1, name: '15th Medical group', shortName: '15th mdg', parentId: null, types: ['CATALOG'] },
    { id: 3, name: 'organization 3', shortName: 'org 3', parentId: 2, types: ['CATALOG'] },
  ]);
});

test('should return users org if is type calalog and any children orgs that are type catalog', () => {
  const orgsWithCatalog = determineOrgsWithCatalogs(
    { ...andrewMonitor, organizationId: 5 } as LoggedInUser,
    organizations
  );

  expect(orgsWithCatalog).toStrictEqual([]);
});

test('should return users org if is type calalog and any children orgs that are type catalog', () => {
  const orgsWithCatalog = determineOrgsWithCatalogs(
    { ...andrewMonitor, organizationId: 3 } as LoggedInUser,
    organizations
  );

  expect(orgsWithCatalog).toStrictEqual([
    { id: 3, name: 'organization 3', shortName: 'org 3', parentId: 2, types: ['CATALOG'] },
  ]);
});
