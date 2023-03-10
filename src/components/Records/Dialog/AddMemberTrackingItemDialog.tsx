import { Autocomplete, Box, Button, CircularProgress, IconButton, TextField } from '@mui/material';
import { MemberTrackingItem, MemberTrackingItemStatus, MemberTrackingRecord, TrackingItem } from '@prisma/client';
import { useSnackbar } from 'notistack';
import React, { useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import tw from 'twin.macro';
import { Close, DeleteIcon } from '../../../assets/Icons';
import { EMtrVariant } from '../../../const/enums';
import { mtiQueryKeys, useCreateMemberTrackingItemAndRecord } from '../../../hooks/api/memberTrackingItem';
import { useCreateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { trackingItemsActiveSelect, useTrackingItems } from '../../../hooks/api/trackingItem';
import { useMemberTrackingItemsForUser } from '../../../hooks/api/users';
import { Dialog, DialogActions, DialogContent, DialogTitle, LoadingOverlay, TempestDatePicker } from '../../../lib/ui';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
import { TrackingItemInterval } from '../../../utils/daysToString';
import { memberTrackingRecordIsComplete } from '../../../utils/status';

const dayjs = require('dayjs');

type IMemberTrackingItemsToAdd = {
  [key: number]: IMemberTrackingItemToAdd;
};

type IMemberTrackingItemToAdd = {
  trackingItem: TrackingItem;
  completedDate: string;
};

type AddMemberTrackingItemDialogProps = {
  handleClose: () => void;
  forMemberId: number;
};

const TableRowHeader = tw.div`text-gray-400 text-sm flex items-center flex-wrap min-width[350px]border-solid border-b border-gray-200`;
const TableRow = tw.div`py-2 text-sm flex items-center flex-wrap min-width[350px]border-solid border-b border-gray-200`;
const TableData = tw.div`pr-3 font-size[12px] flex[0 0 auto] pb-0`;
const StyledDeleteIcon = tw(DeleteIcon)`text-xl`;

const AddMemberTrackingItemDialog: React.FC<AddMemberTrackingItemDialogProps> = ({ handleClose, forMemberId }) => {
  const trackingItemsQuery = useTrackingItems(trackingItemsActiveSelect);
  const addMemberTrackingItemAndRecord = useCreateMemberTrackingItemAndRecord();
  const addMemberTrackingRecord = useCreateMemberTrackingRecord();
  const memberTrackingItemsQuery = useMemberTrackingItemsForUser(forMemberId);
  const queryClient = useQueryClient();

  const [memberTrackingItemsToAdd, setMemberTrackingItemsToAdd] = useState<IMemberTrackingItemsToAdd>([]);
  const [trackingItemOptions, setTrackingItemOptions] = useState<TrackingItem[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);

  useMemo(() => {
    const memberTrackingItemQueries = queryClient.getQueriesData<MemberTrackingItemWithAll>(
      mtiQueryKeys.memberTrackingItems(forMemberId, EMtrVariant.IN_PROGRESS)
    );

    const memberTrackingRecords = memberTrackingItemQueries
      .flatMap((mtiq) => mtiq[1])
      .flatMap((mti) => mti?.memberTrackingRecords);

    const trackingItemsList = trackingItemsQuery.data
      ?.filter(
        (trackingItem) =>
          !memberTrackingRecords?.find(
            (mtr) =>
              mtr?.trackingItemId === trackingItem.id &&
              !memberTrackingRecordIsComplete(mtr) &&
              mtr.traineeId === forMemberId
          )
      )
      .filter(
        (trackingItem) =>
          !memberTrackingItemsQuery?.data?.find(
            (mti) => mti.status === MemberTrackingItemStatus.INACTIVE && mti.trackingItemId === trackingItem.id
          )
      );

    setTrackingItemOptions(trackingItemsList ?? []);
  }, [trackingItemsQuery.data, memberTrackingItemsQuery.data]);

  const addMemberTrackingItems = () => {
    setIsSaving(true);
    for (const memberTrackingItemToAdd of Object.values(memberTrackingItemsToAdd)) {
      const shouldOnlyCreateMemberTrackingRecord = memberTrackingItemsQuery.data?.some(
        (memberTrackingItem) => memberTrackingItem.trackingItemId === memberTrackingItemToAdd.trackingItem.id
      );

      if (shouldOnlyCreateMemberTrackingRecord) {
        const newMemberTrackingRecord: Partial<MemberTrackingRecord> = {
          trackingItemId: memberTrackingItemToAdd.trackingItem.id,
          completedDate: dayjs(memberTrackingItemToAdd.completedDate).toDate(),
          traineeId: forMemberId,
        };

        addMemberTrackingRecord.mutate(newMemberTrackingRecord, {
          onSuccess: () => {
            enqueueSnackbar('A record was successfully added', { variant: 'success' });
          },
          onSettled: () => {
            setIsSaving(false);
            handleClose();
          },
        });
      } else {
        const newMemberTrackingItem = {
          trackingItemId: memberTrackingItemToAdd.trackingItem.id,
          userId: forMemberId,
        } as MemberTrackingItem;

        addMemberTrackingItemAndRecord.mutate(
          {
            newMemberTrackingItem,
            completedDate: memberTrackingItemToAdd.completedDate,
          },
          {
            onSuccess: () => {
              enqueueSnackbar('A record was successfully added', { variant: 'success' });
            },
            onSettled: () => {
              setIsSaving(false);
              handleClose();
            },
          }
        );
      }
    }
  };

  return (
    <Dialog onClose={handleClose} open aria-labelledby="ammembertracking-dialog">
      {isSaving ? <LoadingOverlay /> : null}
      <DialogActions>
        <IconButton
          onClick={handleClose}
          color="secondary"
          aria-label={`dialog-close-button`}
          tw="absolute float-right top-2"
        >
          <Close />
        </IconButton>
      </DialogActions>
      <DialogTitle> Add New Training </DialogTitle>
      <DialogContent>
        <p tw="text-xs pb-4">
          Select one or more training from the below dropdown and insert completion date. If completion date is unknown,
          training will go into draft tab
        </p>
        <Autocomplete
          id="tracking-items-dropdown"
          //This is a hack to get the input box to clear after selecting an option
          key={dayjs().toISOString()}
          options={trackingItemOptions}
          getOptionLabel={(options: TrackingItem) => options.title}
          renderOption={(props, option) => (
            <li {...props}>
              <Box>
                {option.title}
                <br />
                <span tw="text-sm text-gray-400">{option.description}</span>
              </Box>
            </li>
          )}
          onChange={(_event, value) => {
            const selectedTrackingItem = value as unknown as TrackingItem;
            const filteredOptions = trackingItemOptions.filter((tio) => tio.id !== selectedTrackingItem.id);

            setTrackingItemOptions(filteredOptions);

            setMemberTrackingItemsToAdd((old) => ({
              ...old,
              [selectedTrackingItem.id]: {
                trackingItem: selectedTrackingItem,
                completedDate: null,
                location: selectedTrackingItem.location,
              },
            }));
          }}
          size="small"
          loading={trackingItemsQuery?.isLoading || memberTrackingItemsQuery?.isLoading}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search..."
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {trackingItemsQuery?.isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
        />
      </DialogContent>
      <DialogTitle>Trainings to be Added</DialogTitle>
      <DialogContent>
        <TableRowHeader>
          <TableData tw="w-1/4">Training Title</TableData>
          <TableData tw="w-1/5 text-center">Recurrence</TableData>
          <TableData tw="w-1/5 text-center">Location</TableData>
          <TableData tw="text-center">Date Completed</TableData>
          <div></div>
        </TableRowHeader>
        {Object.keys(memberTrackingItemsToAdd).length === 0 ? <div>Nothing to add</div> : null}
        {Object.keys(memberTrackingItemsToAdd).map((key) => {
          const memberTrackingItemToAdd: IMemberTrackingItemToAdd = memberTrackingItemsToAdd[key];

          return (
            <TableRow key={memberTrackingItemToAdd.trackingItem.id}>
              <TableData tw="text-sm w-1/4">{memberTrackingItemToAdd.trackingItem.title}</TableData>
              <TableData tw="text-sm w-1/5 text-center">
                {TrackingItemInterval[memberTrackingItemToAdd.trackingItem.interval]}
              </TableData>
              <TableData tw="text-sm w-1/5 text-center truncate">
                {memberTrackingItemToAdd.trackingItem.location}
              </TableData>
              <TableData>
                <TempestDatePicker
                  onChange={(date: Date) =>
                    setMemberTrackingItemsToAdd((currentValues) => {
                      return {
                        ...currentValues,
                        [key]: {
                          ...currentValues[key],
                          completedDate: dayjs(date).format('YYYY-MM-DD'),
                        } as IMemberTrackingItemToAdd,
                      };
                    })
                  }
                  format="DD MMM YYYY"
                  inputVariant="outlined"
                  disableFuture
                  autoOk
                  value={memberTrackingItemToAdd.completedDate}
                />
              </TableData>
              <TableData tw="ml-auto">
                <IconButton
                  size="small"
                  aria-label="tracking-item-delete-button"
                  onClick={() => {
                    setMemberTrackingItemsToAdd((old) => {
                      const newMemberTrackingItemsToAdd = { ...old };
                      delete newMemberTrackingItemsToAdd[key];
                      return newMemberTrackingItemsToAdd;
                    });
                    setTrackingItemOptions((oldTIs) => [...oldTIs, memberTrackingItemsToAdd[key].trackingItem]);
                  }}
                >
                  <StyledDeleteIcon />
                </IconButton>
              </TableData>
            </TableRow>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={Object.keys(memberTrackingItemsToAdd).length === 0 || memberTrackingItemsQuery.isLoading}
          onClick={addMemberTrackingItems}
          size="medium"
          color="secondary"
          variant="contained"
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { AddMemberTrackingItemDialog };
