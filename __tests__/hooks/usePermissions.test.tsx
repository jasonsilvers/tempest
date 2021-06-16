import { rest } from 'msw';
import usePermissions from '../../src/hooks/usePermissions';
import { grants } from '../utils/mocks/fixtures';
import { server } from '../utils/mocks/msw';
import { renderHook } from '@testing-library/react-hooks';
import { Wrapper } from '../utils/TempestTestUtils';
import { AccessControl } from 'accesscontrol';
import { ERole, EFuncAction, EResource } from '../../src/types/global';

// Establish API mocking before tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should return user and new ac list with grants', async () => {
  server.use(
    rest.get('/api/grants/', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(grants));
    })
  );
  const { result, waitForValueToChange } = renderHook(() => usePermissions(), {
    wrapper: Wrapper,
    initialProps: {
      user: { firstName: 'joe', role: { name: 'admin' } },
    },
  });

  const testAC = new AccessControl(grants);

  await waitForValueToChange(() => result.current.data);

  expect(result.current.ac).toStrictEqual(testAC);
  expect(result.current.role).toStrictEqual('admin');
});

test('should return permission when checking create resourse', async () => {
  server.use(
    rest.get('/api/grants/', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(grants));
    })
  );
  const { result, waitForValueToChange, waitForNextUpdate } = renderHook(() => usePermissions(), {
    wrapper: Wrapper,
    initialProps: {
      user: { firstName: 'joe', role: { name: ERole.MEMBER } },
    },
  });

  await waitForValueToChange(() => result.current.ac);

  const permission = result.current.permissionCheck(
    ERole.MEMBER,
    EFuncAction.READ_OWN,
    EResource.MEMBER_TRACKING_RECORD
  );

  waitForNextUpdate();

  expect(permission.granted).toBe(true);
});

test('sets granted to false when ac.can fails', async () => {
  server.use(
    rest.get('/api/grants/', (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(grants));
    })
  );
  const { result, waitForValueToChange, waitForNextUpdate } = renderHook(() => usePermissions(), {
    wrapper: Wrapper,
    initialProps: {
      user: { firstName: 'joe', role: { name: 'admin' } },
    },
  });

  await waitForValueToChange(() => result.current.ac);

  const permission = result.current.permissionCheck(
    'NOROLEINGRANTS',
    EFuncAction.READ,
    EResource.MEMBER_TRACKING_RECORD
  );

  waitForNextUpdate();

  expect(permission.granted).toBe(false);
});
