import { Card, Checkbox, Divider, Fab, IconButton, TextField } from '@mui/material';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import debounce from 'lodash.debounce';
import { LoggedInUser } from '../repositories/userRepo';

import 'twin.macro';
import { useCreatePpeItem, useDeletePpeItem, usePpeItems, useUpdatePpeItem } from '../hooks/api/ppe';
import { AddIcon, DeleteIcon } from '../assets/Icons';
import { PersonalProtectionEquipmentItem } from '@prisma/client';
import { LoadingSpinner } from '../lib/ui';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Joi from 'joi';
import { Controller, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';

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
  const { mutate: deletePpeItem, isLoading: deleteInFlight } = useDeletePpeItem();
  const { mutate: updatePpeItem, isLoading: updateInFlight } = useUpdatePpeItem();

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
    console.log(data);
    //This is a new record that is created
    if (data.id === -1) {
      delete data.id;
      data.userId = userId;
      create(data);
      return;
    }

    updatePpeItem({ ...data, userId });
  };

  const debouncedChangeHandler = useCallback(debounce(handleChange, 500), []);

  const handleDelete = (id: number) => {
    if (id === -1) {
      removeAddedPpeItem();
      return;
    }
    deletePpeItem(id);
  };

  const inFlight = creatingInFlight || deleteInFlight || updateInFlight;

  return (
    <form onChange={handleSubmit(debouncedChangeHandler)} ref={formRef}>
      <div tw="grid grid-cols-12 gap-1 text-[14px] w-[1400px] p-2">
        <input {...register('id')} hidden defaultValue={localPpeItem.id} readOnly />
        <div tw="p-1 col-span-3 rounded-lg">
          <TextField
            size="small"
            error={!!errors.name}
            fullWidth
            defaultValue={localPpeItem.name}
            inputProps={{ ...register('name'), 'aria-label': 'name' }}
            disabled={inFlight}
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
                {...props}
                checked={props.value}
                color="secondary"
                onChange={(e) => [props.onChange(e.target.checked), handleSubmit]}
                disabled={inFlight}
              />
            )}
          />
        </div>
        <div tw="p-1 col-span-3 rounded-lg ">
          {/* remember to put in placeholder text */}
          {/* shake animation when invalid */}
          <TextField
            size="small"
            fullWidth
            disabled={inFlight}
            multiline
            defaultValue={localPpeItem.providedDetails}
            error={!!errors.provided}
            inputProps={{ ...register('providedDetails'), 'aria-label': 'providedDetails' }}
          />
        </div>
        <div tw="p-1 rounded-lg text-center">
          <Controller
            name="inUse"
            control={control}
            defaultValue={localPpeItem.inUse}
            render={({ field: props }) => (
              <Checkbox
                {...props}
                checked={props.value}
                color="secondary"
                onChange={(e) => [props.onChange(e.target.checked), handleSubmit]}
                disabled={inFlight}
              />
            )}
          />
        </div>
        <div tw="p-1 col-span-3 rounded-lg ">
          <TextField
            size="small"
            fullWidth
            multiline
            defaultValue={localPpeItem.inUseDetails}
            error={!!errors.inUseDetails}
            inputProps={{ ...register('inUseDetails'), 'aria-label': 'inUseDetails' }}
            disabled={inFlight}
          />
        </div>
        <div tw="p-1 rounded-lg ">
          <IconButton
            aria-label="delete"
            onClick={() => handleDelete(localPpeItem.id)}
            disabled={creatingInFlight}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
    </form>
  );
};

const Ppe = () => {
  const { user } = useUser<LoggedInUser>();
  const ppeQuery = usePpeItems(user?.id);

  const [ppeItems, setPpeItems] = useState<PersonalProtectionEquipmentItem[]>([]);

  useEffect(() => {
    setPpeItems(ppeQuery.data);
  }, [ppeQuery.data]);

  const removeAddedPpeItem = () => {
    const ppeItemsWithNewItemRemoved = ppeItems.filter((ppeItem) => ppeItem.id !== -1);

    setPpeItems(ppeItemsWithNewItemRemoved);
  };

  return (
    <div tw="relative min-w-min max-width[1440px] pr-8">
      <div tw="pb-5">
        <ProfileHeader member={user} />
      </div>

      <Card tw="relative min-w-min max-width[1440px] h-auto flex flex-col">
        <div tw="grid grid-cols-12 gap-1 text-[14px] font-bold w-[1400px] p-4">
          <div tw="p-1 col-span-3 rounded-lg ">Personal Protective Equipment</div>
          <div tw="p-1 rounded-lg text-center">Provided</div>
          <div tw="p-1 col-span-3 rounded-lg ">Details</div>
          <div tw="p-1 rounded-lg text-center">In-Use</div>
          <div tw="p-1 col-span-3 rounded-lg ">Details</div>
          <div tw="p-1 rounded-lg "></div>
        </div>
        <Divider />

        {ppeQuery.isLoading && (
          <div tw="p-8 flex justify-center">
            <LoadingSpinner size="60px" />
          </div>
        )}
        {ppeItems?.map((ppeItem) => (
          <PpeItem key={ppeItem.id} ppeItem={ppeItem} userId={user.id} removeAddedPpeItem={removeAddedPpeItem} />
        ))}
        <Divider />
        <div tw="p-3 flex justify-center">
          <Fab
            color="secondary"
            disabled={ppeItems?.some((ppeItem) => ppeItem.id === -1)}
            size="medium"
            variant="circular"
            onClick={() => {
              const newPpeItem: PersonalProtectionEquipmentItem = {
                id: -1,
                name: '',
                provided: false,
                providedDetails: '',
                inUse: false,
                inUseDetails: '',
                userId: user.id,
              };

              setPpeItems([...ppeItems, newPpeItem]);
            }}
          >
            <AddIcon />
          </Fab>
        </div>
      </Card>
    </div>
  );
};

export default withPageAuth(Ppe);
