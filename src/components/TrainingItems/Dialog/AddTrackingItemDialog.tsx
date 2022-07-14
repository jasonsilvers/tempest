import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LoadingOverlay,
  OutlinedInputProps,
  SelectChangeEvent,
} from '../../../lib/ui';
import { Close } from '../../../assets/Icons';
import tw from 'twin.macro';
import { useAddTrackingItem, useTrackingItems } from '../../../hooks/api/trackingItem';
import { TrackingItem } from '@prisma/client';
import Fuse from 'fuse.js';
import ConfirmDialog from '../../Dialog/ConfirmDialog';
import { useSnackbar } from 'notistack';
import { RecurrenceSelect } from '../../RecurrenceSelect';
import { OutlinedInput, IconButton, FormControl, DialogContentText, Button, Typography } from '@mui/material';

const fuseOptions: Fuse.IFuseOptions<TrackingItem> = {
  isCaseSensitive: false,
  includeScore: true,
  includeMatches: true,
  shouldSort: true,
  minMatchCharLength: 3,
  ignoreLocation: true,
  threshold: 0.3,
  keys: ['title'],
};

type AddTrackingItemDialogProps = {
  handleClose: () => void;
  isOpen: boolean;
};

const ShowLoadingOverlay = ({ showLoading }: { showLoading: boolean }) => {
  if (showLoading) {
    return <LoadingOverlay />;
  }

  return null;
};

type TrackingItemToAdd = Omit<TrackingItem, 'id'>;

const TableRowHeader = tw.div`text-gray-400 text-sm flex items-center flex-wrap min-width[450px] border-solid border-b border-gray-200`;
const TableRow = tw.div`py-2 text-sm flex items-center flex-wrap min-width[450px] border-solid border-b border-gray-200`;
const TableData = tw.div`pr-3 font-size[12px] flex[0 0 auto] pb-0`;

const AdjustedOutlinedInput: React.FC<OutlinedInputProps> = (props) => (
  <OutlinedInput margin="dense" fullWidth {...props} />
);

const Bold = tw.div`font-bold bg-yellow-100`;

const initialTrackingItemToAdd: TrackingItemToAdd = {
  title: '',
  description: '',
  interval: null,
  location: '',
  organizationId: null,
};

const resolveAttribute = (obj, key) => key.split('.').reduce((prev, curr) => prev?.[curr], obj);

const highlight = (value: string, indices: readonly Fuse.RangeTuple[] = [], i = 1): JSX.Element => {
  const pair = indices[indices.length - i];
  return !pair ? (
    <p>{value}</p>
  ) : (
    <div tw="flex">
      {highlight(value.substring(0, pair[0]), indices, i + 1)}
      <Bold>{value.substring(pair[0], pair[1] + 1)}</Bold>
      {value.substring(pair[1] + 1)}
    </div>
  );
};

const FuseHighlight = ({ hit, attribute }: { hit: Fuse.FuseResult<TrackingItem>; attribute: string }): JSX.Element => {
  const matches = typeof hit.item === 'string' ? hit.matches?.[0] : hit.matches?.find((m) => m.key === attribute);
  const fallback = typeof hit.item === 'string' ? hit.item : resolveAttribute(hit.item, attribute);

  return highlight(matches?.value || fallback, matches?.indices);
};

const alertIfDuplicate = (trackingItemsThatMatch: Fuse.FuseResult<TrackingItem>[]) => {
  return trackingItemsThatMatch?.some((ti) => +ti.score.toFixed(6) === 0)
    ? '* Unable to add. Duplicates are not allowed in the Global Training Catalog'
    : '';
};

const formIsInValid = (trackingItem: TrackingItemToAdd): boolean => {
  return !trackingItem.title || trackingItem.interval < 0 ? true : false;
};

const isDuplicate = (title: string, trackingItemsThatMatch: Fuse.FuseResult<TrackingItem>[]) => {
  return title === '' || trackingItemsThatMatch?.some((ti) => +ti.score.toFixed(4) === 0);
};

const AddTrackingItemDialog: React.FC<AddTrackingItemDialogProps> = ({ handleClose, isOpen }) => {
  const { mutate: create } = useAddTrackingItem();
  const [isSaving, setIsSaving] = useState(false);
  const { data: trackingItems, isLoading } = useTrackingItems();
  const [trackingItemsThatMatch, setTrackingItemsThatMatch] = useState<Fuse.FuseResult<TrackingItem>[]>(null);
  const [formIsInvalid, setFormIsInvalid] = useState(true);
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false);
  const [trackingItem, setTrackingItem] = useState<TrackingItemToAdd>(initialTrackingItemToAdd);
  const { enqueueSnackbar } = useSnackbar();

  const fuse = useMemo(() => new Fuse(trackingItems ? trackingItems : [], fuseOptions), [trackingItems]);

  useEffect(() => {
    return () => {
      setTrackingItemsThatMatch([]);
      setTrackingItem({
        title: '',
        description: '',
        interval: null,
        location: '',
      } as TrackingItemToAdd);
    };
  }, [isOpen]);

  useEffect(() => {
    if (formIsInValid(trackingItem)) {
      setFormIsInvalid(true);
    } else {
      setFormIsInvalid(false);
    }
  }, [trackingItem]);

  const handleTrackingItemMatch = (e: ChangeEvent<{ value: string }>) => {
    const results = fuse.search(e.target.value.trimEnd());

    setTrackingItemsThatMatch(results);
  };

  const handleTrackingItemInput = (inputName: string, value: string | number) => {
    setTrackingItem((state) => ({ ...state, [inputName]: value }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        handleClose();
      }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="tracking-dialog"
    >
      <ShowLoadingOverlay showLoading={isLoading || isSaving} />
      <DialogActions>
        <IconButton
          onClick={handleClose}
          aria-label="dialog-close-button"
          color="secondary"
          tw="absolute float-right top-2"
        >
          <Close />
        </IconButton>
      </DialogActions>
      <DialogTitle>Create New Training</DialogTitle>
      <DialogContent tw="min-height[220px]">
        <p tw="text-xs pb-4">
          Please create the training title, interval of training, location of training ,and write a brief description of
          training.
        </p>
        <div>
          <FormControl fullWidth>
            {isDuplicate(trackingItem.title, trackingItemsThatMatch) ? (
              <DialogContentText tw="text-red-400 flex">* Title</DialogContentText>
            ) : (
              <DialogContentText>Title</DialogContentText>
            )}
            <AdjustedOutlinedInput
              name="title"
              inputProps={{ 'aria-label': 'training-title-input' }}
              value={trackingItem.title}
              onChange={(e: ChangeEvent<{ name: string; value: string }>) => {
                handleTrackingItemInput(e.target.name, e.target.value);
                handleTrackingItemMatch(e);
              }}
            />
          </FormControl>
        </div>
        <div tw="flex mb-3 space-x-5">
          <div tw="w-1/2">
            {trackingItem.interval < 0 || trackingItem.interval === null ? (
              <DialogContentText tw="text-red-400">* Recurrence </DialogContentText>
            ) : (
              <DialogContentText>Recurrence</DialogContentText>
            )}
            <RecurrenceSelect
              value={trackingItem.interval?.toString()}
              handleChange={(event: SelectChangeEvent) => {
                handleTrackingItemInput('interval', parseInt(event.target.value));
              }}
            />
          </div>
          <div tw="w-1/2">
            <DialogContentText>Location</DialogContentText>

            <AdjustedOutlinedInput
              name="location"
              inputProps={{ 'aria-label': 'training-location-input' }}
              value={trackingItem.location}
              onChange={(e: ChangeEvent<{ name: string; value: string }>) =>
                handleTrackingItemInput(e.target.name, e.target.value)
              }
            />
          </div>
        </div>
        <div>
          <DialogContentText>Description</DialogContentText>

          <AdjustedOutlinedInput
            name="description"
            inputProps={{ 'aria-label': 'training-description-input' }}
            value={trackingItem.description}
            onChange={(e: ChangeEvent<{ name: string; value: string }>) =>
              handleTrackingItemInput(e.target.name, e.target.value)
            }
          />
        </div>

        <div tw="pt-2 text-sm text-red-400">{alertIfDuplicate(trackingItemsThatMatch)}</div>
      </DialogContent>

      {trackingItemsThatMatch?.length > 0 ? (
        <>
          <DialogContent>
            <Typography tw="pb-4" variant="h5">
              Similiar Training Items
            </Typography>
            <p tw="text-sm text-gray-400 pb-5">
              The following trainings already exist within the Global Training Catalog. Please ensure you are not
              creating a duplicate training.
            </p>
            <TableRowHeader>
              <TableData tw="w-1/4">Training Title</TableData>
              <TableData tw="w-1/4 text-center">Interval (days)</TableData>
              <TableData tw="w-1/4">Location</TableData>
              <TableData tw="w-1/4">Description</TableData>
            </TableRowHeader>
            {trackingItemsThatMatch?.map((hit) => (
              <TableRow key={hit.item.id}>
                <TableData tw="text-sm w-1/4 overflow-ellipsis">
                  <FuseHighlight hit={hit} attribute={'title'} />
                </TableData>
                <TableData tw="text-sm w-1/4 text-center">{hit.item.interval}</TableData>
                <TableData tw="text-sm w-1/4 whitespace-normal overflow-ellipsis">
                  <FuseHighlight hit={hit} attribute={'location'} />
                </TableData>
                <TableData tw="text-sm w-1/4 whitespace-nowrap overflow-ellipsis">
                  <FuseHighlight hit={hit} attribute={'description'} />
                </TableData>
              </TableRow>
            ))}
          </DialogContent>
        </>
      ) : null}

      <DialogActions>
        <Button
          onClick={async () => {
            setIsSaving(true);
            if (trackingItemsThatMatch?.length !== 0) {
              setConfirmationIsOpen(true);
            } else {
              //TODO: Refactor and remove as
              create(trackingItem as TrackingItem, {
                onSuccess: () => {
                  handleClose();
                  enqueueSnackbar('Tracking Item Added!', { variant: 'success' });
                },
                onSettled: () => {
                  setIsSaving(false);
                },
              });
            }
          }}
          disabled={formIsInvalid || trackingItemsThatMatch?.some((ti) => +ti.score.toFixed(6) === 0)}
          size="medium"
          color="secondary"
          variant="contained"
        >
          Create
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={confirmationIsOpen}
        handleNo={() => {
          setIsSaving(false);
          setConfirmationIsOpen(false);
        }}
        handleYes={() => {
          setIsSaving(true);
          create(trackingItem as TrackingItem, {
            onSuccess: () => {
              enqueueSnackbar('Tracking Item Added!', { variant: 'success' });
              handleClose();
            },
            onSettled: () => {
              setIsSaving(false);
            },
          });
          setConfirmationIsOpen(false);
        }}
      >
        <div tw="p-4">This is a potential duplicate. Do you want to continue?</div>
      </ConfirmDialog>
    </Dialog>
  );
};

export { AddTrackingItemDialog };
