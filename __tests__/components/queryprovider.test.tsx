import { SnackbarProvider } from 'notistack';
import React from 'react';
import 'whatwg-fetch';
import { QueryProvider } from '../../src/components/QueryProvider';
import { EUri } from '../../src/const/enums';
import { rest, server } from '../testutils/mocks/msw';
import { render, waitForLoadingToFinish } from '../testutils/TempestTestUtils';
import { useUsers } from '../../src/hooks/api/users';
import { Button } from '@mui/material';

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

const TestComponent = () => {
  const { isLoading } = useUsers();

  if (isLoading) {
    return <div>...loading</div>;
  }

  return <div>Test Component</div>;
};

const notistackRef = React.createRef<SnackbarProvider>();
const onClickDismiss = (key: string) => () => {
  notistackRef.current.closeSnackbar(key);
};

test('should show snackbar if 401', async () => {
  server.use(
    rest.get(EUri.USERS, (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({ message: 'you are not authorized' }));
    })
  );

  const { getByText, getByRole } = render(
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key: string) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
    >
      <QueryProvider
        queryClientOptions={{
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        }}
      >
        <TestComponent />
      </QueryProvider>
    </SnackbarProvider>
  );

  await waitForLoadingToFinish();
  getByText(/test/i);
  expect(getByRole('alert')).toBeInTheDocument();
});
