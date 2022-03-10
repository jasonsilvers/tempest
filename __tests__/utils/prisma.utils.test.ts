import { exec } from 'child_process';
import { clear } from '../../src/prisma/utils';

jest.mock('child_process');

test('Should run prisma command', async () => {
  const execMockedFunction = exec as jest.MockedFunction<typeof exec>;
  execMockedFunction.mockImplementation((command, callback) => {
    callback(null, { stdout: 'ok' });
  });

  await expect(clear()).resolves.toEqual({ stdout: 'ok' });
});
