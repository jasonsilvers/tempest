import { Organization } from '@prisma/client';
import 'twin.macro';
import { OrganizationSelect } from '../OrganizationSelect';
import { Actions } from './Types';

type DashboardFilterProps = {
  dispatch: (value: Actions) => void;
};

export const DashboardFilter = ({ dispatch }: DashboardFilterProps) => {
  return (
    <div tw="flex space-x-2">
      <div tw="w-full">
        <OrganizationSelect
          onChange={(_event, value: Organization) =>
            dispatch({ type: 'filterByOrganization', organizationIdFilter: value?.id })
          }
        />
      </div>
    </div>
  );
};
