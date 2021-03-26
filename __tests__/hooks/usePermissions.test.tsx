import { rest } from 'msw';
import usePermissions from '../../hooks/usePermissions';
import { grants } from '../utils/mocks/fixtures';
import { server } from '../utils/mocks/msw';
import { renderHook } from '@testing-library/react-hooks';
import { Wrapper } from '../utils/TempestTestUtils';
import { AccessControl } from 'accesscontrol';

describe('usePermissions', () => {
  it('should return user and new ac list with grants', async () => {
    server.use(
      rest.get('/api/grants/', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(grants));
      })
    );
    const { result, waitForValueToChange, waitForNextUpdate } = renderHook(
      () => usePermissions(),
      {
        wrapper: Wrapper,
        initialProps: {
          user: { name: 'joe', role: { name: 'admin' } },
        },
      }
    );

    const testAC = new AccessControl(grants);

    await waitForValueToChange(() => result.current.data);

    expect(result.current.ac).toStrictEqual(testAC);
    expect(result.current.userRole).toStrictEqual('admin');
  });
});
