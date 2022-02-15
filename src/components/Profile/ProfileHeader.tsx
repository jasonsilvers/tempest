import { Organization, Role, User } from '@prisma/client';
import React, { ChangeEventHandler, useContext, useEffect, useState } from 'react';
import tw from 'twin.macro';
import { EditIcon } from '../../assets/Icons';
import { ranks } from '../../const/ranks';
import { useOrg } from '../../hooks/api/organizations';
import { useUpdateUser } from '../../hooks/api/users';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, IconButton, TextField, Autocomplete, CSSProperties } from '../../lib/ui';
import { ERole } from '../../const/enums';
import ConfirmDialog from '../Dialog/ConfirmDialog';
import { UpdateUsersOrg } from '../UpdateUsersOrg';
import { GroupedRank } from '../../types';

const Name = tw.h4`text-3xl text-black pb-2`;
const Table = tw.div`text-left mb-6`;
const Row = tw.div`flex flex-row p-1`;
const Base = tw.div`text-lg mb-1 text-hg pr-5 capitalize`;
const Rank = tw(Base)`w-24`;
const AFSC = tw(Base)`w-24`;
const OrganizationField = tw(Base)``;

const ProfileHeaderContext = React.createContext({ userId: null, isEdit: false });

const useProfileHeaderContext = () => useContext(ProfileHeaderContext);

const EditButtonGroup: React.FC<{ onSave: () => void; onCancel: () => void; onEdit: () => void }> = ({
  onCancel,
  onSave,
  onEdit,
}) => {
  const { isEdit } = useProfileHeaderContext();
  if (isEdit) {
    return (
      <>
        <Button onClick={onSave}>Save</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </>
    );
  }
  return (
    <IconButton onClick={onEdit} aria-label={`edit-user`} size="small" tw="hover:bg-transparent">
      <EditIcon />
    </IconButton>
  );
};

const EditItem: React.FC<{
  label: string;
  editStyle?: CSSProperties;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}> = ({ children, label, editStyle, onChange }) => {
  const { isEdit } = useProfileHeaderContext();
  const value = React.Children.map(children, (child: React.ReactElement) => child.props.children);

  if (isEdit) {
    return (
      <TextField
        onChange={onChange}
        variant="filled"
        size="small"
        label={label}
        name={`${label}_textfield`}
        id={`${label}_textfield`}
        style={{ paddingRight: '1rem', ...editStyle }}
        defaultValue={value}
      />
    );
  }
  return <div>{children}</div>;
};

const EditOrg: React.FC<{
  label: string;
  editStyle?: CSSProperties;
  onChange?: (org: Organization) => void;
  orgId: string;
}> = ({ children, label, onChange, orgId, editStyle }) => {
  const { userId, isEdit } = useProfileHeaderContext();
  const { role, user, isLoading } = usePermissions();

  if (!isLoading && isEdit && (role === ERole.MEMBER || userId === user?.id)) {
    return (
      <UpdateUsersOrg
        editStyle={editStyle}
        label={label}
        userId={userId}
        userOrganizationId={orgId}
        onChange={onChange}
      />
    );
  }
  return <div>{children}</div>;
};

const EditSelect: React.FC<{
  label: string;
  editStyle?: CSSProperties;
  onChange?: (value: GroupedRank) => void;
}> = ({ children, label, editStyle, onChange }) => {
  const { isEdit } = useProfileHeaderContext();
  const value = React.Children.map(children, (child: React.ReactElement) => child.props.children);

  if (isEdit) {
    return (
      <Autocomplete
        defaultValue={ranks.find((rank) => rank.value === value[0])}
        options={ranks}
        getOptionLabel={(option) => option.value}
        groupBy={(option) => option.group}
        onChange={(event, v) => onChange(v as GroupedRank)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="filled"
            size="small"
            label={label}
            name={`${label}_textfield`}
            id={`${label}_textfield`}
            style={{ paddingRight: '1rem', ...editStyle }}
            InputProps={{
              ...params.InputProps,
            }}
          />
        )}
      />
    );
  }
  return <div>{children}</div>;
};

const ProfileHeader: React.FC<{ member: User & { role: Role } }> = ({ member }) => {
  const [isActiveEdit, setIsActiveEdit] = useState(false);
  const [formState, setFormState] = useState(member);
  const updateUserMutation = useUpdateUser();
  const { data: userOrg } = useOrg(formState?.organizationId);
  const [orgModal, setOrgModal] = useState({ open: false, transientId: member?.organizationId });

  useEffect(() => {
    setFormState(member);
  }, [member]);

  return formState ? (
    <ProfileHeaderContext.Provider value={{ userId: member?.id, isEdit: isActiveEdit }}>
      <div tw="flex space-x-6 items-start">
        <Name>{`${member.lastName}, ${member.firstName}`}</Name>
        <EditButtonGroup
          onEdit={() => setIsActiveEdit(true)}
          onSave={() => {
            updateUserMutation.mutate({
              id: formState.id,
              afsc: formState.afsc,
              organizationId: formState.organizationId,
              rank: formState.rank,
            } as User);
            setIsActiveEdit(false);
          }}
          onCancel={() => {
            setFormState(member);
            setIsActiveEdit(false);
          }}
        />
      </div>

      <Table>
        <Row>
          <EditSelect
            onChange={({ value }) => {
              setFormState((state) => ({ ...state, rank: value }));
            }}
            label="Rank"
            editStyle={{ width: '10rem' }}
          >
            <Rank>{formState.rank}</Rank>
          </EditSelect>

          <EditItem
            label="AFSC"
            editStyle={{ width: '10rem' }}
            onChange={(e) => setFormState((state) => ({ ...state, afsc: e.target.value }))}
          >
            <AFSC>{formState.afsc}</AFSC>
          </EditItem>

          <EditOrg
            label="Organization"
            editStyle={{ width: '20rem' }}
            onChange={(org: Organization) => {
              if (member.role.name === ERole.MEMBER) {
                setFormState((state) => ({ ...state, organizationId: org.id }));
              } else {
                setOrgModal({ open: true, transientId: org.id });
              }
            }}
            orgId={formState.organizationId}
          >
            <OrganizationField>{userOrg?.name ?? ''}</OrganizationField>
          </EditOrg>
        </Row>
      </Table>
      <ConfirmDialog
        open={orgModal.open}
        handleNo={() => setOrgModal((state) => ({ ...state, open: false }))}
        handleYes={() => {
          setFormState((state) => ({ ...state, organizationId: orgModal.transientId }));
          setOrgModal((state) => ({ ...state, open: false }));
        }}
      >
        Changing Organizations will result in loss of permissions. Do you want to continue?
      </ConfirmDialog>
    </ProfileHeaderContext.Provider>
  ) : (
    <></>
  );
};

export { ProfileHeader };
