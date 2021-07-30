import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
  LoadingOverlay,
  IconButton,
} from '../../../lib/ui';
import tw from 'twin.macro';
import { useAddTrackingItem } from '../../../hooks/api/trackingItem';
import { DeleteIcon } from '../../../assets/Icons';
import { DialogContentText, OutlinedInput, OutlinedInputProps } from '@material-ui/core';
import { TrackingItem } from '@prisma/client';

type AddTrackingItemDialogProps = {
  handleClose: () => void;
  isOpen: boolean;
};

type TrackingItemToAdd = Omit<TrackingItem, 'id'>;

const TableRowHeader = tw.div`text-gray-400 text-sm flex items-center flex-wrap min-width[350px]border-solid border-b border-gray-200`;
const TableRow = tw.div`py-2 text-sm flex items-center flex-wrap min-width[350px]border-solid border-b border-gray-200`;
const TableData = tw.div`pr-3 font-size[12px] flex[0 0 auto] pb-0`;
const StyledDeleteIcon = tw(DeleteIcon)`text-xl`;

const InputFieldContainer = tw.div`w-full`;
const AdjustedOutlinedInput: React.FC<OutlinedInputProps> = (props) => (
  <OutlinedInput margin="dense" fullWidth {...props} />
);

//Move the dialog to the left to account for the sidebar
//TODO: Might need to change this based on the sidebar
const Paper = tw.div`ml-80 px-5`;

const AddTrackingItemDialog: React.FC<AddTrackingItemDialogProps> = ({ handleClose, isOpen }) => {
  const { mutate: create } = useAddTrackingItem();
  const [isSaving] = useState(false);
  const [trackingItems, setTrackingItems] = useState([] as TrackingItemToAdd[]);
  const [trackingItem, setTrackingItem] = useState({
    title: '',
    description: '',
    interval: 0,
  } as TrackingItemToAdd);

  useEffect(() => {
    return () => {
      setTrackingItems([]);
      setTrackingItem({
        title: '',
        description: '',
        interval: 0,
      } as TrackingItemToAdd);
    };
  }, [isOpen]);

  const AddPseudoItemToList = () => {
    if (trackingItem.title) {
      setTrackingItems((state) => [...state, { ...trackingItem, title: trackingItem.title.trim() }]);
    }
  };

  return (
    <Dialog
      PaperProps={{ component: Paper }}
      open={isOpen}
      onClose={() => {
        if (trackingItems.length < 1) {
          handleClose();
        }
      }}
      aria-labelledby="tracking-dialog"
    >
      {isSaving ? <LoadingOverlay /> : null}
      <DialogTitle>Create New Training</DialogTitle>
      <DialogContent tw="pr-2 min-height[220px]">
        <p tw="text-xs pb-4">
          Please create the training title, interval of training, and write a brief description of training.
        </p>
        <DialogContent>
          <div tw="flex space-x-5 mb-3">
            <InputFieldContainer>
              <DialogContentText>Training Title</DialogContentText>
              <AdjustedOutlinedInput
                value={trackingItem.title}
                onChange={(e) => setTrackingItem((state) => ({ ...state, title: e.target.value }))}
              />
            </InputFieldContainer>
            <InputFieldContainer>
              <DialogContentText>Training Interval</DialogContentText>
              <AdjustedOutlinedInput
                type="number"
                value={trackingItem.interval}
                onChange={(e) => setTrackingItem((state) => ({ ...state, interval: parseInt(e.target.value) }))}
              />
            </InputFieldContainer>
          </div>
          <InputFieldContainer>
            <DialogContentText>Description</DialogContentText>
            <AdjustedOutlinedInput
              value={trackingItem.description}
              onChange={(e) => setTrackingItem((state) => ({ ...state, description: e.target.value }))}
            />
          </InputFieldContainer>
        </DialogContent>
      </DialogContent>
      <DialogActions>
        <DialogButton
          disabled={
            !trackingItem.title ||
            trackingItems.some(({ title }) => title.trim().toLowerCase() === trackingItem.title.trim().toLowerCase())
          }
          size="small"
          variant="contained"
          onClick={AddPseudoItemToList}
        >
          Create
        </DialogButton>
      </DialogActions>
      {trackingItems.length > 0 ? (
        <>
          <DialogTitle>Trainings to be Added</DialogTitle>
          <DialogContent>
            <p tw="text-xs pb-4">Double check your work and ensure everything is spelled and labeled correctly.</p>
            <TableRowHeader>
              <TableData tw="w-1/3">Training Title</TableData>
              <TableData tw="w-1/5 text-center">Interval (days)</TableData>
              <TableData tw="w-1/3">Description</TableData>
            </TableRowHeader>
            {trackingItems.map((item) => (
              <TableRow key={item.title + item.description}>
                <TableData tw="text-sm w-1/3">{item.title}</TableData>
                <TableData tw="text-sm w-1/5 text-center">{item.interval}</TableData>
                <TableData tw="text-sm w-1/3">{item.description}</TableData>
                <TableData tw="">
                  <IconButton
                    size="small"
                    onClick={() => setTrackingItems((state) => state.filter((stateItem) => stateItem !== item))}
                  >
                    <StyledDeleteIcon />
                  </IconButton>
                </TableData>
              </TableRow>
            ))}
          </DialogContent>
          <DialogActions>
            <DialogButton
              onClick={async () => {
                trackingItems.forEach(async (item) => {
                  create(item as TrackingItem);
                });
                handleClose();
              }}
              size="small"
              variant="contained"
            >
              Add All
            </DialogButton>
            <DialogButton onClick={handleClose} size="small" variant="contained">
              Close
            </DialogButton>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
};

export { AddTrackingItemDialog };
