import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { User } from '@prisma/client';
import React, { ChangeEventHandler, useContext, useEffect, useState } from 'react';
import tw from 'twin.macro';
import { EditIcon } from '../../assets/Icons';
import { ranks, GroupedRank } from '../../const/ranks';
import { useUpdateUser } from '../../hooks/api/users';
import { Button, IconButton, TextField, Autocomplete } from '../../lib/ui';

const Name = tw.h4`text-3xl text-black`;
const Table = tw.div`text-left mb-6`;
const Column = tw.div`flex flex-col`;
const Row = tw.div`flex flex-row`;
const Base = tw.div`text-sm mb-1 text-hg pr-5 capitalize`;
const Rank = tw(Base)`w-24`;
const Address = tw(Base)``;
const AFSC = tw(Base)`w-24`;
const DutyTitle = tw(Base)``;

const ProfileHeaderContext = React.createContext(false);

const useProfileHeaderContext = () => useContext(ProfileHeaderContext);

const EditButtonGroup: React.FC<{ onSave: () => void; onCancel: () => void; onEdit: () => void }> = ({
  onCancel,
  onSave,
  onEdit,
}) => {
  const isEdit = useProfileHeaderContext();
  if (isEdit) {
    return (
      <>
        <Button onClick={onSave}>Save</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </>
    );
  }
  return (
    <IconButton onClick={onEdit} aria-label={`edit-user`} size="small" tw="ml-2 mr-3 hover:bg-transparent">
      <EditIcon />
    </IconButton>
  );
};

const EditItem: React.FC<{
  label: string;
  editStyle?: CSSProperties;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}> = ({ children, label, editStyle, onChange }) => {
  const isEdit = useProfileHeaderContext();
  const value = React.Children.map(children, (child: React.ReactElement) => child.props.children);

  if (isEdit) {
    return (
      <TextField
        onChange={onChange}
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

const EditSelect: React.FC<{
  label: string;
  editStyle?: CSSProperties;
  onChange?: (value: GroupedRank) => void;
}> = ({ children, label, editStyle, onChange }) => {
  const isEdit = useProfileHeaderContext();
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

const ProfileHeader: React.FC<{ user: User }> = ({ user }) => {
  const [isActiveEdit, setIsActiveEdit] = useState(false);
  const [formState, setFormState] = useState(user);
  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    setFormState(user);
  }, [user]);

  return formState ? (
    <ProfileHeaderContext.Provider value={isActiveEdit}>
      <div tw="flex items-center">
        <Name>{`${user.lastName} ${user.firstName}`}</Name>
        <EditButtonGroup
          onEdit={() => setIsActiveEdit(true)}
          onSave={() => {
            updateUserMutation.mutate({
              id: formState.id,
              afsc: formState.afsc,
              dutyTitle: formState.dutyTitle,
              rank: formState.rank,
              address: formState.address,
            } as User);
            setIsActiveEdit(false);
          }}
          onCancel={() => {
            setFormState(user);
            setIsActiveEdit(false);
          }}
        />
      </div>

      <Table>
        <Column>
          <Row>
            <EditSelect
              onChange={({ value }) => {
                console.log(value);

                setFormState((state) => ({ ...state, rank: value }));
              }}
              label="Rank"
              editStyle={{ width: '10rem' }}
            >
              <Rank>{formState.rank}</Rank>
            </EditSelect>
            <EditItem
              label="Office Symbol"
              editStyle={{ width: '20rem' }}
              onChange={(e) => setFormState((state) => ({ ...state, address: e.target.value }))}
            >
              <Address>{formState.address}</Address>
            </EditItem>
          </Row>
        </Column>
        <Column>
          <Row>
            <EditItem
              label="AFSC"
              editStyle={{ width: '10rem' }}
              onChange={(e) => setFormState((state) => ({ ...state, afsc: e.target.value }))}
            >
              <AFSC>{formState.afsc}</AFSC>
            </EditItem>
            <EditItem
              label="Duty Title"
              editStyle={{ width: '20rem' }}
              onChange={(e) => setFormState((state) => ({ ...state, dutyTitle: e.target.value }))}
            >
              <DutyTitle>{formState.dutyTitle}</DutyTitle>
            </EditItem>
          </Row>
        </Column>
      </Table>
    </ProfileHeaderContext.Provider>
  ) : (
    <></>
  );
};

export { ProfileHeader };
