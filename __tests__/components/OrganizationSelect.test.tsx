import { server } from '../testutils/mocks/msw';
import { rest } from 'msw';

import { fireEvent, render, waitForLoadingToFinish } from '../testutils/TempestTestUtils';

import 'whatwg-fetch';
import { ERole, EUri } from '../../src/const/enums';
import { bobJones } from '../testutils/mocks/fixtures';
import { OrganizationSelect } from '../../src/components/OrganizationSelect';
import { LoggedInUser } from '../../src/repositories/userRepo';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

beforeEach(() => {
  server.use(
    // return a user with the right permissions
    rest.get(EUri.LOGIN, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ ...bobJones, role: { id: 0, name: ERole.MONITOR } } as LoggedInUser));
    }),

    rest.get(EUri.ORGANIZATIONS, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          organizations: [
            {
              id: 1,
              name: '15th Medical Group',
              shortName: '15th MDG',
              parentId: null,
            },
            {
              id: 2,
              name: '15 Operation Medical Readiness Squadron',
              shortName: '15 OMRS',
              parentId: 1,
            },
            {
              id: 3,
              name: '15 Healthcare Operation Squadron',
              shortName: '15 HCOS',
              parentId: 1,
            },
            {
              id: 4,
              name: '15th Medical Group Executive Staff',
              shortName: '15th MDG Exc Staff',
              parentId: 1,
            },
            {
              id: 5,
              name: '15 Medical Support Squadron',
              shortName: '15 MDSS',
              parentId: 1,
            },
            {
              id: 6,
              name: 'Aerospace Medicine',
              shortName: 'Aerospace Medicine',
              parentId: 2,
            },
            {
              id: 7,
              name: 'Bioenviromental Engineering',
              shortName: 'Bioenviromental Engineering',
              parentId: 2,
            },
            {
              id: 8,
              name: 'Dental',
              shortName: 'Dental',
              parentId: 2,
            },
            {
              id: 9,
              name: 'Public Health',
              shortName: 'Public Health',
              parentId: 2,
            },
            {
              id: 10,
              name: 'Active Duty Clinic',
              shortName: 'Active Duty Clinic',
              parentId: 2,
            },
            {
              id: 11,
              name: 'Physical Therapy',
              shortName: 'Physical Therapy',
              parentId: 2,
            },
            {
              id: 12,
              name: 'Mental Health/ADAPT',
              shortName: 'Mental Health/ADAPT',
              parentId: 2,
            },
            {
              id: 13,
              name: 'Clinical Medicine',
              shortName: 'Clinical Medicine',
              parentId: 3,
            },
            {
              id: 14,
              name: 'Ohana Clinic',
              shortName: 'Ohana Clinic',
              parentId: 3,
            },
            {
              id: 15,
              name: 'Pharmacy',
              shortName: 'Pharmacy',
              parentId: 5,
            },
            {
              id: 16,
              name: 'Diagnostics and Therapeutics ',
              shortName: 'D&T',
              parentId: 5,
            },
            {
              id: 17,
              name: 'Readiness',
              shortName: 'Readiness',
              parentId: 5,
            },
            {
              id: 18,
              name: 'Medical Logistics',
              shortName: 'Medical Logistics',
              parentId: 5,
            },
            {
              id: 19,
              name: 'Resource Management Office',
              shortName: 'Resource Management Office',
              parentId: 5,
            },
            {
              id: 20,
              name: 'Tricare operations and patient administration',
              shortName: 'TOPA',
              parentId: 5,
            },
            {
              id: 21,
              name: 'Information Systems Flight',
              shortName: 'Information Systems Flight',
              parentId: 5,
            },
            {
              id: 22,
              name: 'Faculty Managers',
              shortName: 'Faculty Managers',
              parentId: 5,
            },
          ],
        })
      );
    })
  );
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

it('should display organization and group by parent', async () => {
  const { getByText, getByTestId } = render(<OrganizationSelect onChange={() => null} />);

  fireEvent.click(getByTestId('ArrowDropDownIcon'));
  await waitForLoadingToFinish();

  fireEvent.click(getByText(/15th mdg/i));
});
