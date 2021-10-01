import { User } from '@prisma/client';
import dayjs from 'dayjs';
import { act, fireEvent, render } from '../../../testutils/TempestTestUtils';
import { RecordSignatureToolTip } from '../../../../src/components/Records/Actions/RecordSignatureToolTip';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('show display rank', () => {
  const testTrainee = {
    id: '123',
    firstName: 'bob',
    lastName: 'jones',
    rank: 'SSgt/E-5',
  } as User;

  const traineeSignature = { signee: testTrainee, date: dayjs().toDate() };

  const { getByRole, getByText, queryByRole } = render(
    <RecordSignatureToolTip traineeSignature={traineeSignature}>
      <button>The content</button>
    </RecordSignatureToolTip>
  );

  fireEvent.mouseOver(getByRole('button'));

  act(() => {
    jest.advanceTimersByTime(1000);
  });

  const tooltipDisplayText = 'SSgt bob jones';
  const tooltipDisplayDiv = getByText(tooltipDisplayText);

  expect(tooltipDisplayDiv).toBeInTheDocument();

  act(() => {
    fireEvent.mouseLeave(getByRole('button'));
    jest.advanceTimersByTime(5000);
  });

  expect(queryByRole(tooltipDisplayText)).not.toBeInTheDocument();
});

test('show display no rank if not provided', () => {
  const testTrainee = {
    id: '123',
    firstName: 'bob',
    lastName: 'jones',
    rank: null,
  } as User;

  const traineeSignature = { signee: testTrainee, date: dayjs().toDate() };

  const { getByRole, queryByText } = render(
    <RecordSignatureToolTip traineeSignature={traineeSignature}>
      <button>The content</button>
    </RecordSignatureToolTip>
  );

  fireEvent.mouseOver(getByRole('button'));

  act(() => {
    fireEvent.mouseLeave(getByRole('button'));
    jest.advanceTimersByTime(5000);
  });

  const tooltipDisplayText = 'bob jones';

  expect(queryByText(tooltipDisplayText)).not.toBeInTheDocument();
});
