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
import { Organization, TrackingItem } from '@prisma/client';
import Fuse from 'fuse.js';
import ConfirmDialog from '../../Dialog/ConfirmDialog';
import { useSnackbar } from 'notistack';
import { RecurrenceSelect } from '../../RecurrenceSelect';
import {
  OutlinedInput,
  IconButton,
  FormControl,
  DialogContentText,
  Button,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import { determineOrgsWithCatalogs } from '../../../utils/determineOrgsWithCatalogs';
import { useOrgs } from '../../../hooks/api/organizations';
import { useUser } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../../../repositories/userRepo';
import { ERole } from '../../../const/enums';

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

type SelectCatalogProps = {
  selectedCatalog: string;
  setSelectedCatalog: React.Dispatch<React.SetStateAction<string>>;
  loggedInUser: LoggedInUser;
  catalogs: Organization[];
  setTrackingItem: React.Dispatch<React.SetStateAction<TrackingItemToAdd>>;
};

const handleTrackingItemInput = (
  inputName: string,
  value: string | number,
  setter: React.Dispatch<React.SetStateAction<TrackingItemToAdd>>
) => {
  setter((state) => ({ ...state, [inputName]: value }));
};

const SelectCatalog = ({
  selectedCatalog,
  setSelectedCatalog,
  loggedInUser,
  catalogs,
  setTrackingItem,
}: SelectCatalogProps) => {
  const isAdmin = loggedInUser?.role?.name === ERole.ADMIN;

  const determineIfSelectCatalogIsShown = () => {
    return loggedInUser && catalogs.length > 0;
  };

  const addGlobalSelectIfAdmin = () => {
    return isAdmin ? <MenuItem value={0}>Global Training Catalog</MenuItem> : null;
  };

  const handleCatalogChange = (event: SelectChangeEvent) => {
    setSelectedCatalog(event.target.value);
  };

  return (
    <div tw="pb-5">
      {determineIfSelectCatalogIsShown() ? (
        <Select
          tw="bg-white w-full"
          labelId="add-tracking-item-catalog-select"
          id="add-tracking-item-catalog-select"
          value={selectedCatalog?.toString()}
          onChange={(event: SelectChangeEvent) => {
            handleCatalogChange(event);
            handleTrackingItemInput('organizationId', parseInt(event.target.value), setTrackingItem);
          }}
        >
          {addGlobalSelectIfAdmin()}
          {catalogs.map((catalog) => (
            <MenuItem key={catalog.id} value={catalog.id}>
              {catalog.name}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <div>Test</div>
      )}
    </div>
  );
};

const determineSelectedCatalog = (catalogs: Organization[], loggedInUser: LoggedInUser, defaultCatalog: string) => {
  if (defaultCatalog !== '0') {
    return defaultCatalog;
  }

  if (catalogs.length > 0 && loggedInUser?.role?.name !== ERole.ADMIN && defaultCatalog === '0') {
    return catalogs[0].id.toString();
  }
  return '0';
};

type AddTrackingItemDialogProps = {
  handleClose: () => void;
  isOpen: boolean;
  defaultCatalog?: string;
};

const AddTrackingItemDialog: React.FC<AddTrackingItemDialogProps> = ({ handleClose, isOpen, defaultCatalog = '' }) => {
  const { user: loggedInUser, isLoading: isUserLoading } = useUser<LoggedInUser>();
  const { mutate: create } = useAddTrackingItem();
  const [isSaving, setIsSaving] = useState(false);
  const { data: trackingItems, isLoading } = useTrackingItems();
  const [trackingItemsThatMatch, setTrackingItemsThatMatch] = useState<Fuse.FuseResult<TrackingItem>[]>(null);
  const [formIsInvalid, setFormIsInvalid] = useState(true);
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(defaultCatalog.toString());
  const [trackingItem, setTrackingItem] = useState<TrackingItemToAdd>(initialTrackingItemToAdd);
  const [catalogs, setCatalogs] = useState<Organization[]>([]);
  const { data: orgsFromServer } = useOrgs();
  const { enqueueSnackbar } = useSnackbar();

  const fuse = useMemo(() => new Fuse(trackingItems ? trackingItems : [], fuseOptions), [trackingItems]);

  useEffect(() => {
    const determinedSelectedCatalog = determineSelectedCatalog(catalogs, loggedInUser, defaultCatalog);
    setSelectedCatalog(determinedSelectedCatalog);
  }, [loggedInUser, catalogs]);

  useEffect(() => {
    return () => {
      setTrackingItemsThatMatch([]);
      setTrackingItem({
        title: '',
        description: '',
        interval: null,
        location: '',
        organizationId: null,
      } as TrackingItemToAdd);
    };
  }, [isOpen]);

  useEffect(() => {
    if (formIsInValid(trackingItem)) {
      setFormIsInvalid(true);
      return;
    }
    setFormIsInvalid(false);
  }, [trackingItem]);

  useEffect(() => {
    if (orgsFromServer?.length > 0) {
      const orgsUserCanAddTrackingItems = determineOrgsWithCatalogs(loggedInUser, orgsFromServer);

      setCatalogs(orgsUserCanAddTrackingItems);
    }
  }, [orgsFromServer, loggedInUser]);

  const handleTrackingItemMatch = (e: ChangeEvent<{ value: string }>) => {
    const results = fuse.search(e.target.value.trimEnd());

    setTrackingItemsThatMatch(results);
  };

  const handleOnSettled = () => {
    setIsSaving(false);
    const determinedSelectedCatalog = determineSelectedCatalog(catalogs, loggedInUser, defaultCatalog);
    setSelectedCatalog(determinedSelectedCatalog);
  };

  const handleSave = (isConfirmed = false) => {
    console.log('calle dhandle save');
    setIsSaving(true);
    if (trackingItemsThatMatch?.length !== 0 && !isConfirmed) {
      setConfirmationIsOpen(true);
      return;
    }
    const newTrackingItem = { ...trackingItem, organizationId: parseInt(selectedCatalog) };

    create(newTrackingItem, {
      onSuccess: () => {
        handleClose();
        enqueueSnackbar('Tracking Item Added!', { variant: 'success' });
      },
      onSettled: handleOnSettled,
    });
  };

  const disableSaveButton = () => {
    return formIsInvalid || trackingItemsThatMatch?.some((ti) => +ti.score.toFixed(6) === 0);
  };

  const getSelectedCatalogName = () => {
    return orgsFromServer.find((org) => org.id.toString() === selectedCatalog).name;
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
      <ShowLoadingOverlay showLoading={isLoading || isSaving || isUserLoading} />
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

        <SelectCatalog
          catalogs={catalogs}
          loggedInUser={loggedInUser}
          selectedCatalog={selectedCatalog}
          setSelectedCatalog={setSelectedCatalog}
          setTrackingItem={setTrackingItem}
        />
        <FormControl fullWidth tw="pb-5">
          {isDuplicate(trackingItem.title, trackingItemsThatMatch) ? (
            <DialogContentText tw="text-red-400 flex">* Training Title</DialogContentText>
          ) : (
            <DialogContentText>Training Title</DialogContentText>
          )}
          <AdjustedOutlinedInput
            name="title"
            inputProps={{ 'aria-label': 'training-title-input' }}
            value={trackingItem.title}
            onChange={(e: ChangeEvent<{ name: string; value: string }>) => {
              handleTrackingItemInput(e.target.name, e.target.value, setTrackingItem);
              handleTrackingItemMatch(e);
            }}
          />
        </FormControl>

        <div tw="flex space-x-5 pb-5">
          <div tw="w-1/2">
            {trackingItem.interval < 0 || trackingItem.interval === null ? (
              <DialogContentText tw="text-red-400">* Recurrence </DialogContentText>
            ) : (
              <DialogContentText>Recurrence</DialogContentText>
            )}
            <RecurrenceSelect
              value={trackingItem.interval?.toString()}
              handleChange={(event: SelectChangeEvent) => {
                handleTrackingItemInput('interval', parseInt(event.target.value), setTrackingItem);
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
                handleTrackingItemInput(e.target.name, e.target.value, setTrackingItem)
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
              handleTrackingItemInput(e.target.name, e.target.value, setTrackingItem)
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
              {`The following trainings already exist either within the Global Training Catalog or ${getSelectedCatalogName()} . Please ensure you are not
              creating a duplicate training.`}
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
          onClick={() => handleSave()}
          disabled={disableSaveButton()}
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
          handleSave(true);
          setConfirmationIsOpen(false);
        }}
      >
        <div tw="p-4">This is a potential duplicate. Do you want to continue?</div>
      </ConfirmDialog>
    </Dialog>
  );
};

export { AddTrackingItemDialog };
