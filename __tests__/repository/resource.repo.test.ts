import primsa from '../setup/mockedPrisma';
import { getResource } from '../../src/repositories/resourceRepo';

const testResource = [
  { id: 1, name: 'authorityrecords' },
  { id: 2, name: 'admin' },
  { id: 3, name: 'dashboard' },
  { id: 4, name: 'profile' },
  { id: 5, name: 'mattermost' },
  { id: 6, name: 'membertrackingrecord' },
  { id: 7, name: 'membertrackingitem' },
  { id: 8, name: 'organization' },
  { id: 9, name: 'record' },
  { id: 10, name: 'traineerecords' },
  { id: 11, name: 'trackingitem' },
  { id: 12, name: 'user' },
  { id: 13, name: 'role' },
  { id: 14, name: 'upload' },
];

test('shoud find resources', async () => {
  primsa.resource.findMany.mockImplementation(() => testResource);
  const result = await getResource();
  expect(result).toStrictEqual(testResource);
});
