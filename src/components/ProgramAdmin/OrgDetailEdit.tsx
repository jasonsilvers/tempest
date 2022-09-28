import { joiResolver } from '@hookform/resolvers/joi';
import { Button, FormControl, InputLabel, MenuItem, Popover, Select, TextField, Typography } from '@mui/material';
import { Organization, OrganizationType } from '@prisma/client';
import { Controller, useForm } from 'react-hook-form';
import Joi from 'joi';
import 'twin.macro';
import { useDeleteOrganization, useOrgs, useUpdateOrganization } from '../../hooks/api/organizations';
import { useSnackbar } from 'notistack';
import { OrgWithCounts } from '../../repositories/organizationRepo';
import { useState } from 'react';

const DeleteButton: React.FC<{ childrenCount: number; usersCount: number; deleteOrg: () => void }> = ({
  childrenCount,
  usersCount,
  deleteOrg,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const canDelete = childrenCount === 0 && usersCount === 0;
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
  org: OrgWithCounts;
  closeEdit: () => void;
};

const formSchema = Joi.object({
  name: Joi.string().required(),
  shortName: Joi.string().optional(),
  parentId: Joi.number().optional(),
  orgCatalog: Joi.string().optional(),
});

export const OrgDetailEdit: React.FC<OrgDetailEditProps> = ({ org, closeEdit }) => {
  const orgsListQuery = useOrgs();

  const { mutate: deleteOrg } = useDeleteOrganization();
  const { mutate: updateOrg } = useUpdateOrganization();
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(formSchema),
    defaultValues: {
      parentId: org.parentId ? org.parentId : '',
      name: org.name,
      shortName: org.shortName,
      orgCatalog: org.types.includes(OrganizationType.CATALOG) ? 'yes' : 'no',
    },
  });

  const submitForm = (data) => {
    console.log(data);
    const updatedOrg: Organization = {
      id: org.id,
      parentId: data.parentId,
      name: data.name,
      shortName: data.shortName,
      types: data.orgCatalog === 'yes' ? [OrganizationType.CATALOG] : [],
    };

    updateOrg(updatedOrg);
  };

  const deleteOrgFunc = () => {
    deleteOrg(org.id, {
      onSuccess: () => {
        closeEdit();
        enqueueSnackbar('Organization Deleted', { variant: 'success' });
      },
      onError: (error: { response: { status: number; data: { message: string } } }) => {
        if (error.response.status === 409) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    });
  };

  return (
    <>
      <div tw="flex flex-col pt-5 px-3 space-y-4">
        <div tw="flex flex-col pb-6 items-center space-y-4">
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Organization Selected:
          </Typography>
          <Typography variant="h6">{org.name}</Typography>
        </div>

        <form id="edit-form" onSubmit={handleSubmit(submitForm)}>
          <div tw="flex flex-col w-full space-y-4 px-3">
            <FormControl fullWidth error={!!errors.name}>
              <TextField
                error={!!errors.name}
                fullWidth
                size="small"
                label="Name"
                inputProps={{ ...register('name'), 'aria-label': 'name' }}
              />
            </FormControl>
            <FormControl fullWidth error={!!errors.shortName}>
              <TextField
                error={!!errors.shortName}
                fullWidth
                size="small"
                label="Short Name"
                inputProps={{ ...register('shortName'), 'aria-label': 'shortName' }}
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
                          label="Organization"
                          inputProps={{
                            id: 'select-org',
                          }}
                        >
                          <MenuItem key="noneselected" value="none">
                            No Org Selected
                          </MenuItem>
                          {orgsListQuery?.data?.map((orgItem) => (
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
        <DeleteButton childrenCount={org._count.children} usersCount={org._count.users} deleteOrg={deleteOrgFunc} />

        <div tw="p-5 pt-20 flex space-x-4 justify-evenly">
          <Button variant="outlined" color="secondary" onClick={closeEdit}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" form="edit-form">
            UPDATE
          </Button>
        </div>
      </div>
    </>
  );
};
