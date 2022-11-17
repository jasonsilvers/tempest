import { GridRowModel } from '@mui/x-data-grid';
import { TrackingItem } from '@prisma/client';
import { Dispatch, SetStateAction } from 'react';

export type ItemsProps = {
  rows: TrackingItem[];
  processRowUpdate: (
    newRow: GridRowModel<TrackingItem>,
    oldRow: GridRowModel<TrackingItem>
  ) =>
    | string
    | {
        id: number;
        location: string;
      };
  selectedCatalog: number;
};

type ActiveItemCallback = Dispatch<
  SetStateAction<{
    isOpen: boolean;
    trackingItemId: number;
  }>
>;

export type ActiveItemsListProps = {
  rows: TrackingItem[];
  processRowUpdate: (
    newRow: GridRowModel<TrackingItem>,
    oldRow: GridRowModel<TrackingItem>
  ) =>
    | string
    | {
        id: number;
        location: string;
      };
  selectedCatalog: number;
  actionCallBacks: {
    delete: ActiveItemCallback;
    archive: ActiveItemCallback;
  };
};
