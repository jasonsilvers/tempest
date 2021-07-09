import { fireEvent, render, waitFor, userEvent, waitForElementToBeRemoved } from '../utils/TempestTestUtils';
import Excel from '../../src/pages/Excel/index';
import fs from 'fs';

console.log(fs.realpathSync('./'));

const blob = fs.readFileSync('__tests__/setup/test.xlsx');

test('should upload excel file', async () => {
  const excelFile = new File([blob], 'dummy excel.xlsx', {
    type: 'excel',
  });

  const { getByLabelText, getByText, queryByText } = render(<Excel />);

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
  const excelFile = new File([blob], 'dummy excel.txt', {
    type: 'excel',
  });

  const { getByLabelText, getByText, queryByText } = render(<Excel />);

  const input = getByLabelText('Upload') as HTMLInputElement;
  userEvent.upload(input, excelFile);
  expect(input.files[0]).toStrictEqual(excelFile);
  fireEvent.change(input);
  fireEvent.click(getByText(/Submit/i));
  expect(queryByText(/A1/i)).toBeFalsy();
});
