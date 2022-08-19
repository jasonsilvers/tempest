import { GridRowModel } from '@mui/x-data-grid';
import { TrackingItem } from '@prisma/client';

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
