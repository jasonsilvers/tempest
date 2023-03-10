import { Card, Checkbox, Divider, Fab, IconButton, TextField } from '@mui/material';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import debounce from 'lodash.debounce';
import { ProfileHeader } from '../../../components/Profile/ProfileHeader';
import { findUserById, UserWithAll } from '../../../repositories/userRepo';

import { joiResolver } from '@hookform/resolvers/joi';
import { PersonalProtectionEquipmentItem } from '@prisma/client';
import Joi from 'joi';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'twin.macro';
import { AddIcon, DeleteIcon } from '../../../assets/Icons';
import { useCreatePpeItem, useDeletePpeItem, usePpeItems, useUpdatePpeItem } from '../../../hooks/api/ppe';
import { useMember } from '../../../hooks/api/users';
import { LoadingSpinner } from '../../../lib/ui';

const ppeItemSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string().required(),
  provided: Joi.boolean(),
  providedDetails: Joi.string().allow(''),
  inUse: Joi.boolean(),
  inUseDetails: Joi.string().allow(''),
});

const PpeItem = ({
  ppeItem,
  userId,
  removeAddedPpeItem,
}: {
  ppeItem: PersonalProtectionEquipmentItem;
  userId: number;
  removeAddedPpeItem: () => void;
}) => {
  const { mutate: create, isLoading: creatingInFlight } = useCreatePpeItem();
  const { mutate: deletePpeItem, isLoading: deleteInFlight } = useDeletePpeItem(userId);
  const { mutate: updatePpeItem } = useUpdatePpeItem();

  const [localPpeItem] = useState(() => ppeItem);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: joiResolver(ppeItemSchema),
  });

  const ref = useRef(null);
  const formRef = useRef(null);

  useLayoutEffect(() => {
    if (ppeItem.id === -1) {
      ref.current.focus();
    }
  }, []);

  const handleChange = (data: PersonalProtectionEquipmentItem) => {
    //This is a new record that is created
    if (data.id === -1) {
      delete data.id;
      data.userId = userId;
      create(data, {
        onSettled: () => removeAddedPpeItem(),
      });
      return;
    }

    updatePpeItem({ ...data, userId });
  };

  const debouncedChangeHandler = useCallback(debounce(handleChange, 1000), []);

  const handleDelete = (id: number) => {
    if (id === -1) {
      removeAddedPpeItem();
      return;
    }
    deletePpeItem(id);
  };

  const disabled = creatingInFlight || deleteInFlight;

  return (
    <form onChange={handleSubmit(debouncedChangeHandler)} ref={formRef}>
      <div tw="grid grid-cols-12 gap-1 text-[14px] w-[1200px] p-5">
        <input {...register('id')} hidden defaultValue={localPpeItem.id} readOnly />
        <div tw="p-1 col-span-9 rounded-lg">
          <TextField
            size="small"
            error={!!errors.name}
            fullWidth
            disabled={disabled}
            placeholder="Enter Title"
            defaultValue={localPpeItem.name}
            inputProps={{ ...register('name'), 'aria-label': 'name' }}
            inputRef={ref}
          />
        </div>
        <div tw="p-1 rounded-lg text-center">
          <Controller
            name="provided"
            control={control}
            defaultValue={localPpeItem.provided}
            render={({ field: props }) => (
              <Checkbox
                inputProps={{ 'aria-label': 'checkbox-provided' }}
                checked={props.value}
                disabled={disabled}
                color="secondary"
                onChange={(e) => [props.onChange(e.target.checked), handleSubmit]}
                {...props}
              />
            )}
          />
        </div>
        <div tw="p-1 rounded-lg text-center">
          <Controller
            name="inUse"
            control={control}
            defaultValue={localPpeItem.inUse}
            render={({ field: props }) => (
              <Checkbox
                inputProps={{ 'aria-label': 'checkbox-inuse' }}
                checked={props.value}
                disabled={disabled}
                color="secondary"
                onChange={(e) => [props.onChange(e.target.checked), handleSubmit]}
                {...props}
              />
            )}
          />
        </div>
        <div tw="p-1 rounded-lg ">
          <IconButton
            aria-label="delete"
            onClick={() => handleDelete(localPpeItem.id)}
            disabled={disabled}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
    </form>
  );
};

const sortItemsByIdFromOldestToNewest = (a, b) => a.id - b.id;

const PpePage: React.FC<{ initialMemberData: UserWithAll }> = ({ initialMemberData }) => {
  const {
    query: { id },
  } = useRouter();

  const userId = parseInt(id?.toString());
  const { data: member } = useMember(userId, initialMemberData);
  const ppeQuery = usePpeItems(userId);

  const [ppeItems, setPpeItems] = useState<PersonalProtectionEquipmentItem[]>([]);
  const [addInitialItem, setAddInitialItem] = useState(true);

  let ppeItemsFromServer = [];

  if (ppeQuery.data) {
    ppeItemsFromServer = [...ppeQuery.data].sort(sortItemsByIdFromOldestToNewest);
  }

  const addPpeItem = () => {
    const newPpeItem: PersonalProtectionEquipmentItem = {
      id: -1,
      name: '',
      provided: false,
      providedDetails: '',
      inUse: false,
      inUseDetails: '',
      userId: userId,
    };

    setPpeItems([...ppeItems, newPpeItem]);
  };

  const removeAddedPpeItem = () => {
    const ppeItemsWithNewItemRemoved = ppeItems.filter((ppeItem) => ppeItem.id !== -1);
    setPpeItems(ppeItemsWithNewItemRemoved);
  };

  if (ppeQuery.isFetched && ppeQuery.data.length === 0 && addInitialItem) {
    addPpeItem();
    setAddInitialItem(false);
  }

  return (
    <div tw="relative min-w-min max-width[1200px] p-5">
      <div tw="pb-5">
        <ProfileHeader member={member} />
      </div>

      <Card tw="relative min-w-min max-width[1200px] h-auto flex flex-col">
        <div tw="grid grid-cols-12 gap-1 text-[14px] font-bold w-[1200px] p-4">
          <div tw="p-1 col-span-9 rounded-lg">Personal Protective Equipment </div>
          <div tw="p-1 rounded-lg text-center">Provided</div>
          <div tw="p-1 rounded-lg text-center">In-Use</div>
          <div tw="p-1 rounded-lg "></div>
        </div>
        <Divider />

        {ppeQuery.isLoading && (
          <div tw="p-8 flex justify-center">
            <LoadingSpinner size="60px" />
          </div>
        )}
        {ppeItemsFromServer.map((ppeItem) => (
          <PpeItem key={ppeItem.id} ppeItem={ppeItem} userId={userId} removeAddedPpeItem={removeAddedPpeItem} />
        ))}
        {ppeItems.map((ppeItem) => (
          <PpeItem key={ppeItem.id} ppeItem={ppeItem} userId={userId} removeAddedPpeItem={removeAddedPpeItem} />
        ))}
        <Divider />
        <div tw="p-3 flex justify-center">
          <Fab
            color="secondary"
            disabled={ppeItems?.some((ppeItem) => ppeItem.id === -1) || ppeQuery.isFetching}
            size="medium"
            variant="circular"
            onClick={addPpeItem}
            aria-label="add-button"
          >
            <AddIcon />
          </Fab>
        </div>
      </Card>
    </div>
  );
};

export default withPageAuth(PpePage);

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { params } = context;

  const userId = parseInt(params?.id as string);

  const initialMemberData = await findUserById(userId);

  return {
    props: {
      initialMemberData,
      userId,
    },
  };
}
