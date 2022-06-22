import {
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { TrackingItem } from '@prisma/client';
import React, { useState } from 'react';
import { UseQueryResult } from 'react-query';
import 'twin.macro';
import { SearchIcon } from '../../assets/Icons';
import { useAssignManyTrackingItemsToManyUsers, useJob } from '../../hooks/api/bulk';
import { useTrackingItems } from '../../hooks/api/trackingItem';
import { UserWithAll } from '../../repositories/userRepo';
import { BulkTrackingBodyItem } from '../../utils/bulk';
import { TrackingItemInterval } from '../../utils/daysToString';

type MassAssignResultDialogProps = {
  jobId: number;
};

const MassAssignResultDialog = ({ jobId }: MassAssignResultDialogProps) => {
  const jobQuery = useJob(jobId);

  console.log(jobQuery.data);
  return <div>test</div>;
};

type MassAssignProps = {
  usersQuery: UseQueryResult<UserWithAll[]>;
};

type MassAssignSelectionProps = {
  usersQuery: UseQueryResult<UserWithAll[]>;
  trackingItemsQuery: UseQueryResult<TrackingItem[], unknown>;
  selectedUserIds: number[];
  setSelectedUserIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedTrackingItemIds: number[];
  setSelectedTrackingItemIds: React.Dispatch<React.SetStateAction<number[]>>;
};

type MassAssignSelectionTrackingItemsProps = {
  trackingItemsQuery: UseQueryResult<TrackingItem[], unknown>;
  selectedTrackingItemIds: number[];
  setSelectedTrackingItemIds: React.Dispatch<React.SetStateAction<number[]>>;
};

const MassAssignSelectionTrackingItems = ({
  trackingItemsQuery,
  selectedTrackingItemIds,
  setSelectedTrackingItemIds,
}: MassAssignSelectionTrackingItemsProps) => {
  const [page, setPage] = React.useState(0);

  const handleTrackingItemIdCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const trackingItemId = parseInt(event.target.id);

    if (event.target.checked) {
      setSelectedTrackingItemIds([...selectedTrackingItemIds, trackingItemId]);
      return;
    }

    const selectedTrackingITemIdsWIthoutTrackingItem = selectedTrackingItemIds.filter(
      (selectedTrackingItemId) => selectedTrackingItemId !== trackingItemId
    );
    setSelectedTrackingItemIds(selectedTrackingITemIdsWIthoutTrackingItem);
  };

  const isTrackingItemChecked = (trackingItemId: number) => {
    return selectedTrackingItemIds.includes(trackingItemId);
  };

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  return (
    <div tw="flex-auto flex-col space-x-2 items-center">
      <div tw="flex flex-row items-center py-5">
        <div tw="w-1/3">
          <Typography variant="subtitle1">Training(s)</Typography>
        </div>
        <div tw="w-2/3">
          <TextField
            tw="bg-white rounded w-full"
            id="SearchBar"
            label="Search"
            size="small"
            // value={dashboardState.nameFilter}
            // onChange={(event) => dispatch({ type: 'filterByName', nameFilter: event.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>

      <div tw="border rounded-md min-height[360px]">
        <div tw="flex flex-row items-center border-b px-2">
          <FormControlLabel
            control={
              <Checkbox
                onChange={() => {
                  const allChecked = trackingItemsQuery.data?.every((ti) => isTrackingItemChecked(ti.id));
                  const tiIdsToAdd = trackingItemsQuery.data
                    .filter((user) => !isTrackingItemChecked(user.id))
                    .map((ti) => ti.id);
                  setSelectedTrackingItemIds(allChecked ? [] : [...selectedTrackingItemIds, ...tiIdsToAdd]);
                }}
                checked={selectedTrackingItemIds.length === trackingItemsQuery.data?.length}
                size="medium"
              />
            }
            label={
              <div tw="flex flex-row">
                <div tw="w-56 pr-6 font-bold">Item</div>
                <div tw="w-24 font-bold">Recurrence</div>
              </div>
            }
          />
        </div>
        {trackingItemsQuery?.data?.slice(page * 5, (page + 1) * 5).map((ti) => (
          <div tw="flex flex-row items-center pb-4 p-2" key={ti.id}>
            <FormControlLabel
              control={
                <Checkbox
                  id={ti.id.toString()}
                  onChange={handleTrackingItemIdCheckBoxChange}
                  checked={isTrackingItemChecked(ti.id)}
                  size="medium"
                />
              }
              label={
                <div tw="flex flex-row">
                  <div tw="w-56 pr-6">{ti.title}</div>
                  <div tw="w-24">{TrackingItemInterval[ti.interval]}</div>
                </div>
              }
            />
          </div>
        ))}
        <div tw="flex space-x-5 items-center px-2">
          <div tw="mr-auto">
            <Typography variant="subtitle1" color="secondary">
              Selected ({selectedTrackingItemIds.length})
            </Typography>
          </div>

          <TablePagination
            component="div"
            count={trackingItemsQuery.data ? trackingItemsQuery.data.length : 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[10]}
            rowsPerPage={5}
          />
        </div>
      </div>
    </div>
  );
};

type MassAssignSelectionMembersProps = {
  usersQuery: UseQueryResult<UserWithAll[]>;
  selectedUserIds: number[];
  setSelectedUserIds: React.Dispatch<React.SetStateAction<number[]>>;
};

const MassAssignSelectionMembers = ({
  usersQuery,
  selectedUserIds,
  setSelectedUserIds,
}: MassAssignSelectionMembersProps) => {
  const [page, setPage] = React.useState(0);

  const handleUserIdCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userId = parseInt(event.target.id);

    if (event.target.checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
      return;
    }

    const selectedUserIdsWIthoutUser = selectedUserIds.filter((selectedUserId) => selectedUserId !== userId);
    setSelectedUserIds(selectedUserIdsWIthoutUser);
  };

  const isUserChecked = (userId: number) => {
    return selectedUserIds.includes(userId);
  };

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  return (
    <div tw="flex-auto flex-col space-x-2 items-center">
      <div tw="flex flex-row items-center py-5">
        <div tw="w-1/3">
          <Typography variant="subtitle1">Member(s)</Typography>
        </div>
        <div tw="w-2/3">
          <TextField
            tw="bg-white rounded w-full"
            id="SearchBar"
            label="Search"
            size="small"
            // value={dashboardState.nameFilter}
            // onChange={(event) => dispatch({ type: 'filterByName', nameFilter: event.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>

      <div tw="border rounded-md min-height[360px]">
        <div tw="flex flex-row items-center border-b px-2">
          <FormControlLabel
            control={
              <Checkbox
                onChange={() => {
                  const allChecked = usersQuery.data?.every((user) => isUserChecked(user.id));
                  const userIdsToAdd = usersQuery.data.filter((user) => !isUserChecked(user.id)).map((user) => user.id);
                  setSelectedUserIds(allChecked ? [] : [...selectedUserIds, ...userIdsToAdd]);
                }}
                checked={selectedUserIds.length === usersQuery.data?.length}
                size="medium"
              />
            }
            label={
              <div tw="flex flex-row">
                <div tw="w-56 pr-6 font-bold">Name</div>
                <div tw="w-24 font-bold">Rank</div>
              </div>
            }
          />
        </div>
        {usersQuery?.data?.slice(page * 5, (page + 1) * 5).map((user) => (
          <div tw="flex flex-row items-center pb-4 p-2" key={user.id}>
            <FormControlLabel
              control={
                <Checkbox
                  id={user.id.toString()}
                  onChange={handleUserIdCheckBoxChange}
                  checked={isUserChecked(user.id)}
                  size="medium"
                />
              }
              label={
                <div tw="flex flex-row">
                  <div tw="w-56 pr-6">
                    {user.firstName} {user.lastName}
                  </div>
                  <div tw="w-24">{user.rank}</div>
                </div>
              }
            />
          </div>
        ))}
        <div tw="flex space-x-5 items-center px-2">
          <div tw="mr-auto">
            <Typography variant="subtitle1" color="secondary">
              Selected ({selectedUserIds.length})
            </Typography>
          </div>

          <TablePagination
            component="div"
            count={usersQuery.data ? usersQuery.data.length : 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[10]}
            rowsPerPage={5}
          />
        </div>
      </div>
    </div>
  );
};

export const MassAssignSelection = ({
  usersQuery,
  trackingItemsQuery,
  selectedUserIds,
  setSelectedUserIds,
  selectedTrackingItemIds,
  setSelectedTrackingItemIds,
}: MassAssignSelectionProps) => {
  return (
    <>
      <Typography variant="h6">Assign Training</Typography>
      <div tw="flex flex-row space-x-4">
        <MassAssignSelectionMembers
          usersQuery={usersQuery}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
        />
        <MassAssignSelectionTrackingItems
          trackingItemsQuery={trackingItemsQuery}
          selectedTrackingItemIds={selectedTrackingItemIds}
          setSelectedTrackingItemIds={setSelectedTrackingItemIds}
        />
      </div>
    </>
  );
};

type MassAssignReviewProps = {
  usersQuery: UseQueryResult<UserWithAll[]>;
  trackingItemsQuery: UseQueryResult<TrackingItem[], unknown>;
  selectedUserIds: number[];
  setSelectedUserIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedTrackingItemIds: number[];
  setSelectedTrackingItemIds: React.Dispatch<React.SetStateAction<number[]>>;
};

export const MassAssignReview = ({
  usersQuery,
  trackingItemsQuery,
  selectedUserIds,
  // setSelectedUserIds,
  selectedTrackingItemIds,
}: // setSelectedTrackingItemIds,
MassAssignReviewProps) => {
  return (
    <div>
      {usersQuery.data
        .filter((user) => selectedUserIds.find((selectedUser) => selectedUser === user.id))
        .map((userToAssign) => (
          <div key={userToAssign.id}>{userToAssign.firstName}</div>
        ))}
      {trackingItemsQuery.data
        .filter((ti) => selectedTrackingItemIds.find((selectedTi) => selectedTi === ti.id))
        .map((trackingItemToAssign) => (
          <div key={trackingItemToAssign.id}>{trackingItemToAssign.title}</div>
        ))}
    </div>
  );
};

type MassAssignStep = 'Assign' | 'Review';

export const MassAssign = ({ usersQuery }: MassAssignProps) => {
  const trackingItemsQuery = useTrackingItems();
  const { mutate: assign } = useAssignManyTrackingItemsToManyUsers();
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedTrackingItemIds, setSelectedTrackingItemIds] = useState<number[]>([]);
  const [step, setStep] = useState<MassAssignStep>('Assign');
  const [resultDialogOpen, setResultDialogOpen] = useState(null);

  const assignTrainingItemsToUsers = () => {
    const body: BulkTrackingBodyItem[] = [];

    selectedUserIds.forEach((userId) => {
      selectedTrackingItemIds.forEach((trackingItemId) => {
        const bodyItem: BulkTrackingBodyItem = {
          userId,
          trackingItemId,
          isActive: true,
        };
        body.push(bodyItem);
      });
    });

    assign(body, {
      onSuccess: (response) => {
        setSelectedTrackingItemIds([]);
        setSelectedUserIds([]);
        setStep('Assign');
        setResultDialogOpen(response.data.id);
      },
    });
  };

  return (
    <>
      <Card tw="p-5">
        {step === 'Assign' ? (
          <>
            <MassAssignSelection
              usersQuery={usersQuery}
              trackingItemsQuery={trackingItemsQuery}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              selectedTrackingItemIds={selectedTrackingItemIds}
              setSelectedTrackingItemIds={setSelectedTrackingItemIds}
            />
            <div tw="pt-6">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setStep('Review')}
                disabled={selectedUserIds.length === 0 || selectedTrackingItemIds.length === 0}
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
        {step === 'Review' ? (
          <>
            <MassAssignReview
              usersQuery={usersQuery}
              trackingItemsQuery={trackingItemsQuery}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              selectedTrackingItemIds={selectedTrackingItemIds}
              setSelectedTrackingItemIds={setSelectedTrackingItemIds}
            />
            <Button variant="contained" color="secondary" onClick={() => setStep('Assign')}>
              Back
            </Button>
            <Button variant="contained" color="secondary" onClick={assignTrainingItemsToUsers}>
              Assign
            </Button>
          </>
        ) : null}
      </Card>
      {resultDialogOpen !== null && <MassAssignResultDialog jobId={resultDialogOpen} />}
    </>
  );
};
