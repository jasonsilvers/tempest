import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Organization } from '@prisma/client';
import 'twin.macro';
import { useOrgsLoggedInUsersOrgAndDown } from '../../hooks/api/organizations';
import { LoadingSpinner } from '../../lib/ui';
import { Actions } from './Types';

type DashboardFilterProps = {
  dispatch: (value: Actions) => void;
  initOrg: number;
  orgList: Organization[];
};

export const DashboardFilter = ({ dispatch, initOrg, orgList }: DashboardFilterProps) => {
  return (
    <div tw="flex space-x-2 pt-2">
      <div tw="w-full">
        <Select
          fullWidth
          variant="standard"
          size="small"
          value={initOrg ? initOrg.toString() : ''}
          onChange={(event: SelectChangeEvent) =>
            dispatch({ type: 'filterByOrganization', organizationIdFilter: parseInt(event.target.value) })
          }
        >
          {orgList?.map((organization) => {
            return (
              <MenuItem key={organization.id} value={organization.id}>
                {organization.name}
              </MenuItem>
            );
          })}
        </Select>
      </div>
    </div>
  );
};
