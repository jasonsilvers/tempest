import { fireEvent, render, waitFor, userEvent, waitForElementToBeRemoved } from '../utils/TempestTestUtils';
import Excel from '../../src/pages/Excel/index';
import fs from 'fs';
import { ERole, EUri } from '../../src/const/enums';
import { server, rest } from '../utils/mocks/msw';
import 'whatwg-fetch';

const blob = fs.readFileSync('__tests__/setup/test.xlsx');

// Establish API mocking before tests.
beforeAll(() => {
  server.listen();
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

test('should upload excel file', async () => {
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          firstName: 'bob',
          lastName: 'jones',
          role: {
            id: 22,
            name: ERole.ADMIN,
          },
        })
      );
    })
  );
  const excelFile = new File([blob], 'dummy excel.xlsx', {
    type: 'excel',
  });

  const { getByLabelText, getByText, queryByText } = render(<Excel />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  await waitFor(() => getByLabelText('Upload'));
  const input = getByLabelText('Upload') as HTMLInputElement;
  userEvent.upload(input, excelFile);
  expect(input.files[0]).toStrictEqual(excelFile);
  fireEvent.change(input);
  fireEvent.click(getByText(/Submit/i));

  await waitFor(() => getByText(/A1/i));
  getByText(/A1/i);
  fireEvent.click(getByText(/clear/i));
  expect(queryByText(/A1/i)).toBeFalsy();
});

test('should not upload excel file based on file extension', async () => {
  server.use(
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          firstName: 'bob',
          lastName: 'jones',
          role: {
            id: 22,
            name: ERole.ADMIN,
          },
        })
      );
    })
  );

  const excelFile = new File([blob], 'dummy excel.txt', {
    type: 'excel',
  });

  const { getByLabelText, getByText, queryByText } = render(<Excel />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  const input = getByLabelText('Upload') as HTMLInputElement;
  userEvent.upload(input, excelFile);
  expect(input.files[0]).toStrictEqual(excelFile);
  fireEvent.change(input);
  fireEvent.click(getByText(/Submit/i));
  expect(queryByText(/A1/i)).toBeFalsy();
});

test('should deny permissions for non admin users', async () => {
  const { getByText, queryByText } = render(<Excel />);
  await waitForElementToBeRemoved(() => getByText(/loading/i));
  expect(queryByText(/permission/i)).toBeTruthy();
});
