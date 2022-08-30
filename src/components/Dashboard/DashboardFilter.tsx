import { InputAdornment, TextField } from '@mui/material';
import { Organization } from '@prisma/client';
import { SearchIcon } from '../../assets/Icons';
import { IDashboardState } from '../../pages/Dashboard';
import { OrganizationSelect } from '../OrganizationSelect';
import { Actions } from './Types';
import 'twin.macro';

type DashboardFilterProps = {
  dispatch: (value: Actions) => void;
  dashboardState: IDashboardState;
};

export const DashboardFilter = ({ dashboardState, dispatch }: DashboardFilterProps) => {
  return (
    <div tw="flex space-x-2">
      <div tw="w-1/2">
        <TextField
          tw="bg-white rounded w-full"
          id="SearchBar"
          label="Search"
          value={dashboardState.nameFilter}
          onChange={(event) => dispatch({ type: 'filterByName', nameFilter: event.target.value })}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <div tw="w-1/2">
        <OrganizationSelect
          onChange={(_event, value: Organization) =>
            dispatch({ type: 'filterByOrganization', organizationIdFilter: value?.id })
          }
        />
      </div>
    </div>
  );
};
