import { useOrgs } from '../hooks/api/organizations';
import { useUpdateUser } from '../hooks/api/users';
import { MenuItem } from '@material-ui/core';
import { TempestSelect } from '../lib/ui';
import { User } from '@prisma/client';
import { useSnackbar } from 'notistack';
import { useUser } from '@tron/nextjs-auth-p1';

import 'twin.macro';

type OrgFormEvent = React.ChangeEvent<{ value: string }>;

export const UpdateUsersOrg = ({ userId, userOrganizationId = '' }: { userId: string; userOrganizationId: string }) => {
  const { refreshUser } = useUser();
  const orgsQuery = useOrgs();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: updateUser } = useUpdateUser();

  const updateOrg = (event: OrgFormEvent) => {
    const selectedOrgId = event.target.value;

    if (selectedOrgId !== userOrganizationId) {
      const updatedUser = {
        id: userId,
        organizationId: selectedOrgId,
      } as User;
      updateUser(updatedUser, {
        onSuccess: () => {
          refreshUser();
          enqueueSnackbar('Organization Changed', { variant: 'success' });
        },
      });
    }
  };

  return (
    <>
      {orgsQuery.isLoading ? (
        <div>...loading</div>
      ) : (
        <TempestSelect
          variant="outlined"
          onChange={(event: OrgFormEvent) => updateOrg(event)}
          tw="text-gray-400 w-64"
          value={userOrganizationId}
        >
          {orgsQuery.data?.map((org) => (
            <MenuItem key={org.id} value={org.id}>
              {org.name}
            </MenuItem>
          ))}
        </TempestSelect>
      )}
    </>
  );
};
