import { joiResolver } from '@hookform/resolvers/joi';
import { Button, FormControl, InputLabel, MenuItem, Popover, Select, TextField, Typography } from '@mui/material';
import { Organization, OrganizationType } from '@prisma/client';
import { Controller, useForm } from 'react-hook-form';
import Joi from 'joi';
import 'twin.macro';
import {
  useDeleteOrganization,
  useOrg,
  useOrgsLoggedInUsersOrgAndDown,
  useUpdateOrganization,
} from '../../hooks/api/organizations';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

const DeleteButton: React.FC<{ childrenCount: number; usersCount: number; deleteOrg: () => void }> = ({
  childrenCount,
  usersCount,
  deleteOrg,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const canDelete = childrenCount === 0 && usersCount === 0;

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (!canDelete) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <div tw="p-3" onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
      <Button disabled={!canDelete} fullWidth color="error" variant="outlined" onClick={deleteOrg}>
        Delete
      </Button>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>
          Unable to delete because org has {childrenCount} children orgs and {usersCount} users.
        </Typography>
      </Popover>
    </div>
  );
};

type OrgDetailEditProps = {
  orgFromList: Organization;
  closeEdit: () => void;
};

const formSchema = Joi.object({
  name: Joi.string().required(),
  shortName: Joi.string().optional(),
  parentId: Joi.number().optional().allow('none'),
  orgCatalog: Joi.string().optional(),
});

export const OrgDetailEdit: React.FC<OrgDetailEditProps> = ({ orgFromList, closeEdit }) => {
  const orgFromServerQuery = useOrg(orgFromList?.id);
  const orgsListQuery = useOrgsLoggedInUsersOrgAndDown();

  const orgList = orgsListQuery?.data?.filter((org) => org.id !== orgFromList?.id);

  const { mutate: deleteOrg } = useDeleteOrganization();
  const { mutate: updateOrg } = useUpdateOrganization();
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    register,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: joiResolver(formSchema),
    defaultValues: {
      parentId: orgFromList?.parentId ? orgFromList?.parentId : 'none',
      name: orgFromList?.name,
      shortName: orgFromList?.shortName,
      orgCatalog: orgFromList?.types?.includes(OrganizationType.CATALOG) ? 'yes' : 'no',
    },
  });

  const updateDisabled = Object.keys(dirtyFields).length === 0;

  const submitForm = (data) => {
    const updatedOrg: Organization = {
      id: orgFromList?.id,
      parentId: data.parentId !== 'none' ? data.parentId : null,
      name: data.name,
      shortName: data.shortName,
      types: data.orgCatalog === 'yes' ? [OrganizationType.CATALOG] : [],
    };

    updateOrg(updatedOrg, {
      onSuccess: () => {
        closeEdit();
      },
    });
  };

  const deleteOrgFunc = () => {
    deleteOrg(orgFromList?.id, {
      onSuccess: () => {
        closeEdit();
        enqueueSnackbar('Organization Deleted', { variant: 'success' });
      },
    });
  };

  if (orgFromServerQuery.isLoading || orgsListQuery.isLoading) {
    return <div>...loading</div>;
  }

  return (
    <>
      <div tw="flex flex-col pt-5 px-3 space-y-4">
        <div tw="flex flex-col pb-6 items-center space-y-4">
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Organization Selected:
          </Typography>
          <Typography variant="h6">{orgFromList?.name}</Typography>
        </div>

        <form id="edit-form" onSubmit={handleSubmit(submitForm)}>
          <div tw="flex flex-col w-full space-y-4 px-3">
            <FormControl fullWidth error={!!errors.name}>
              <TextField
                error={!!errors.name}
                fullWidth
                size="small"
                label="Name"
                inputProps={{ ...register('name'), 'aria-label': 'org-name' }}
              />
            </FormControl>
            <FormControl fullWidth error={!!errors.shortName}>
              <TextField
                error={!!errors.shortName}
                fullWidth
                size="small"
                label="Short Name"
                inputProps={{ ...register('shortName'), 'aria-label': 'org-shortName' }}
              />
            </FormControl>

            {orgsListQuery?.isLoading ? (
              <div>...loading</div>
            ) : (
              <>
                <FormControl fullWidth>
                  <Controller
                    name="parentId"
                    control={control}
                    render={({ field }) => (
                      <>
                        <InputLabel shrink htmlFor="select-org">
                          Parent Organization
                        </InputLabel>
                        <Select
                          {...field}
                          size="small"
                          fullWidth
                          label="Parent Organization"
                          inputProps={{
                            id: 'select-org',
                            'aria-label': 'parent-select',
                          }}
                        >
                          {orgList.length === 0 ? (
                            <MenuItem key="noneselected" value="none">
                              No Org Selected
                            </MenuItem>
                          ) : null}
                          {orgList?.map((orgItem) => (
                            <MenuItem key={orgItem.id} value={orgItem.id}>
                              {orgItem.shortName}
                            </MenuItem>
                          ))}
                        </Select>
                      </>
                    )}
                  />
                </FormControl>
              </>
            )}
            <FormControl fullWidth>
              <Controller
                name="orgCatalog"
                control={control}
                render={({ field }) => (
                  <>
                    <InputLabel shrink htmlFor="select-types">
                      Organizational Catalog
                    </InputLabel>
                    <Select
                      {...field}
                      size="small"
                      fullWidth
                      label="Organizational Catalog"
                      inputProps={{
                        id: 'select-org',
                      }}
                    >
                      <MenuItem key="yes" value="yes">
                        Yes
                      </MenuItem>
                      <MenuItem key="no" value="no">
                        No
                      </MenuItem>
                    </Select>
                  </>
                )}
              />
            </FormControl>
          </div>
        </form>
        {orgFromServerQuery?.data ? (
          <DeleteButton
            childrenCount={orgFromServerQuery?.data?.children?.length}
            usersCount={orgFromServerQuery?.data?.users?.length}
            deleteOrg={deleteOrgFunc}
          />
        ) : (
          <div>...checking if Org can be deleted</div>
        )}

        <div tw="p-5 pt-20 flex space-x-4 justify-evenly">
          <Button variant="outlined" color="secondary" onClick={closeEdit}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" form="edit-form" disabled={updateDisabled}>
            UPDATE
          </Button>
        </div>
      </div>
    </>
  );
};
