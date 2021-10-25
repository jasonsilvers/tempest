import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  DialogTitle,
  LoadingOverlay,
  DialogContentText,
  OutlinedInput,
  OutlinedInputProps,
  FormControl,
} from '../../../lib/ui';
import tw from 'twin.macro';
import { useAddTrackingItem, useTrackingItems } from '../../../hooks/api/trackingItem';
import { TrackingItem } from '@prisma/client';
import Fuse from 'fuse.js';
import ConfirmDialog from '../../Dialog/ConfirmDialog';

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

type TrackingItemToAdd = Omit<TrackingItem, 'id'>;

const TableRowHeader = tw.div`text-gray-400 text-sm flex items-center flex-wrap min-width[450px] border-solid border-b border-gray-200`;
const TableRow = tw.div`py-2 text-sm flex items-center flex-wrap min-width[450px] border-solid border-b border-gray-200`;
const TableData = tw.div`pr-3 font-size[12px] flex[0 0 auto] pb-0`;

const InputFieldContainer = tw.div`w-full`;
const AdjustedOutlinedInput: React.FC<OutlinedInputProps> = (props) => (
  <OutlinedInput margin="dense" fullWidth {...props} />
);

const Bold = tw.div`font-bold bg-yellow-100`;

//Move the dialog to the left to account for the sidebar
const Paper = tw.div`w-[900px] ml-80`;

const initialTrackingItemToAdd: TrackingItemToAdd = { title: '', description: '', interval: 0 };

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
  return !trackingItem.title || !trackingItem.description || trackingItem.interval === 0 ? true : false;
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

  const fuse = useMemo(() => new Fuse(trackingItems ? trackingItems : [], fuseOptions), [trackingItems]);

  useEffect(() => {
    return () => {
      setTrackingItemsThatMatch([]);
      setTrackingItem({
        title: '',
        description: '',
        interval: 0,
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
      PaperProps={{ component: Paper }}
      open={isOpen}
      onClose={() => {
        handleClose();
      }}
      aria-labelledby="tracking-dialog"
    >
      {isSaving || isLoading ? <LoadingOverlay /> : null}
      <DialogTitle>Create New Training</DialogTitle>
      <DialogContent tw="min-height[220px]">
        <p tw="text-xs pb-4">
          Please create the training title, interval of training, and write a brief description of training.
        </p>
        <DialogContent>
          <div tw="flex space-x-5 mb-3">
            <InputFieldContainer>
              <FormControl>
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
            </InputFieldContainer>
            <InputFieldContainer>
              {trackingItem.interval === 0 ? (
                <DialogContentText tw="text-red-400">* Interval </DialogContentText>
              ) : (
                <DialogContentText>Interval</DialogContentText>
              )}
              <AdjustedOutlinedInput
                required
                name="interval"
                inputProps={{ 'aria-label': 'training-interval-input' }}
                type="number"
                value={trackingItem.interval}
                onChange={(e: ChangeEvent<{ name: string; value: string }>) =>
                  handleTrackingItemInput(e.target.name, parseInt(e.target.value))
                }
              />
            </InputFieldContainer>
          </div>
          <InputFieldContainer>
            {trackingItem.description === '' ? (
              <DialogContentText tw="text-red-400">* Description</DialogContentText>
            ) : (
              <DialogContentText>Description</DialogContentText>
            )}
            <AdjustedOutlinedInput
              required
              name="description"
              inputProps={{ 'aria-label': 'training-description-input' }}
              value={trackingItem.description}
              onChange={(e: ChangeEvent<{ name: string; value: string }>) =>
                handleTrackingItemInput(e.target.name, e.target.value)
              }
            />
          </InputFieldContainer>
        </DialogContent>
        <div tw="pt-2 text-sm text-red-400">{alertIfDuplicate(trackingItemsThatMatch)}</div>
      </DialogContent>

      {trackingItemsThatMatch?.length > 0 ? (
        <>
          <DialogTitle>Matches</DialogTitle>
          <DialogContent>
            <p tw="text-xs pb-4">Below are potential duplicates based on the title you entered. </p>
            <TableRowHeader>
              <TableData tw="w-1/3">Training Title</TableData>
              <TableData tw="w-1/4 text-center">Interval (days)</TableData>
              <TableData tw="w-1/3">Description</TableData>
            </TableRowHeader>
            {trackingItemsThatMatch?.map((hit) => (
              <TableRow key={hit.item.id}>
                <TableData tw="text-sm w-1/3 overflow-ellipsis">
                  <FuseHighlight hit={hit} attribute={'title'} />
                </TableData>
                <TableData tw="text-sm w-1/4 text-center">{hit.item.interval}</TableData>
                <TableData tw="text-sm w-1/3 overflow-ellipsis">
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
              create(trackingItem as TrackingItem, {
                onSuccess: () => {
                  handleClose();
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
        <Button onClick={handleClose} size="medium" color="secondary">
          Close
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
