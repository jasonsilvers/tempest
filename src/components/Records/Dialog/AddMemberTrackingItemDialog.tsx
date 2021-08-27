import React, { useMemo, useState } from 'react';
import {
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
  IconButton,
  LoadingOverlay,
  TextField,
} from '../../../lib/ui';
import tw from 'twin.macro';
import { useTrackingItems } from '../../../hooks/api/trackingItem';
import { MemberTrackingItem, MemberTrackingRecord, TrackingItem } from '.prisma/client';
const dayjs = require('dayjs');
import { DeleteIcon } from '../../../assets/Icons';
import { useCreateMemberTrackingItemAndRecord, useMemberTrackingItems } from '../../../hooks/api/memberTrackingItem';
import { useCreateMemberTrackingRecord } from '../../../hooks/api/memberTrackingRecord';
import { useSnackbar } from 'notistack';

type IMemberTrackingItemsToAdd = {
  [key: number]: IMemberTrackingItemToAdd;
};

type IMemberTrackingItemToAdd = {
  trackingItem: TrackingItem;
  completedDate: string;
};

type AddMemberTrackingItemDialogProps = {
  handleClose: () => void;
  forMemberId: string;
};

const TableRowHeader = tw.div`text-gray-400 text-sm flex items-center flex-wrap min-width[350px]border-solid border-b border-gray-200`;
const TableRow = tw.div`py-2 text-sm flex items-center flex-wrap min-width[350px]border-solid border-b border-gray-200`;
const TableData = tw.div`pr-3 font-size[12px] flex[0 0 auto] pb-0`;
const StyledDeleteIcon = tw(DeleteIcon)`text-xl`;

//Move the dialog to the left to account for the sidebar
//TODO: Might need to change this based on the sidebar
const Paper = tw.div`ml-80`;

const AddMemberTrackingItemDialog: React.FC<AddMemberTrackingItemDialogProps> = ({ handleClose, forMemberId }) => {
  const trackingItemsQuery = useTrackingItems();
  const addMemberTrackingItemAndRecord = useCreateMemberTrackingItemAndRecord();
  const addMemberTrackingRecord = useCreateMemberTrackingRecord();
  const memberTrackingItemsQuery = useMemberTrackingItems(forMemberId);

  const [memberTrackingItemsToAdd, setMemberTrackingItemsToAdd] = useState<IMemberTrackingItemsToAdd>([]);
  const [trackingItemOptions, setTrackingItemOptions] = useState<TrackingItem[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const [isSaving, setIsSaving] = useState(false);

  useMemo(() => {
    setTrackingItemOptions(trackingItemsQuery.data ?? []);
  }, [trackingItemsQuery.data]);

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
            enqueueSnackbar('A record was successfully addded', { variant: 'success' });
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
          isActive: true,
        } as MemberTrackingItem;

        addMemberTrackingItemAndRecord.mutate(
          {
            newMemberTrackingItem,
            completedDate: memberTrackingItemToAdd.completedDate,
          },
          {
            onSuccess: () => {
              enqueueSnackbar('A record was successfully addded', { variant: 'success' });
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
    <Dialog PaperProps={{ component: Paper }} onClose={handleClose} open aria-labelledby="ammembertracking-dialog">
      {isSaving ? <LoadingOverlay /> : null}
      <DialogTitle>Add New Training</DialogTitle>
      <DialogContent>
        <p tw="text-xs pb-4">
          Select one or more training from the below dropdown and insert completion date. If completion date is unknown,
          training will go into draft tab
        </p>
        <Autocomplete
          id="tracking-items-dropdown"
          //This is a hack to get the input box to clear after selecting an option
          //TODO: Figure out a better way to do this
          key={dayjs().toISOString()}
          options={trackingItemOptions}
          getOptionLabel={(options) => options.title}
          onChange={(event, value) => {
            const selectedTrackingItem = value as TrackingItem;
            const filteredOptions = trackingItemOptions.filter((tio) => tio.id !== selectedTrackingItem.id);

            setTrackingItemOptions(filteredOptions);

            setMemberTrackingItemsToAdd((old) => ({
              ...old,
              [selectedTrackingItem.id]: {
                trackingItem: selectedTrackingItem,
                completedDate: null,
              },
            }));
          }}
          size="small"
          loading={trackingItemsQuery?.isLoading}
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
          <TableData tw="w-1/3">Training Title</TableData>
          <TableData tw="w-1/5 text-center">Interval (days)</TableData>
          <TableData>Date Completed</TableData>
          <div></div>
        </TableRowHeader>
        {Object.keys(memberTrackingItemsToAdd).length === 0 ? <div>Nothing to add</div> : null}
        {Object.keys(memberTrackingItemsToAdd).map((key) => {
          const memberTrackingItemToAdd: IMemberTrackingItemToAdd = memberTrackingItemsToAdd[key];

          return (
            <TableRow key={memberTrackingItemToAdd.trackingItem.id}>
              <TableData tw="text-sm w-1/3">{memberTrackingItemToAdd.trackingItem.title}</TableData>
              <TableData tw="text-sm w-1/5 text-center">{memberTrackingItemToAdd.trackingItem.interval}</TableData>
              <TableData>
                <TextField
                  InputProps={{ style: { fontSize: 14 } }}
                  onChange={(event) =>
                    setMemberTrackingItemsToAdd((currentValues) => {
                      return {
                        ...currentValues,
                        [key]: {
                          ...currentValues[key],
                          completedDate: dayjs(event.target.value).format('YYYY-MM-DD'),
                        } as IMemberTrackingItemToAdd,
                      };
                    })
                  }
                  id="date"
                  type="date"
                  variant="outlined"
                  size="small"
                  defaultValue={null}
                  InputLabelProps={{
                    shrink: true,
                  }}
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
        <DialogButton
          disabled={Object.keys(memberTrackingItemsToAdd).length === 0 || memberTrackingItemsQuery.isLoading}
          onClick={addMemberTrackingItems}
          size="medium"
          variant="contained"
        >
          Add
        </DialogButton>
        <DialogButton onClick={handleClose} size="medium" variant="contained">
          Close
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

export { AddMemberTrackingItemDialog };
