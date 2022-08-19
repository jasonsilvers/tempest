import {
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Step,
  StepLabel,
  Stepper,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { Job, JobStatus, TrackingItem } from '@prisma/client';
import React, { useEffect, useRef, useState } from 'react';
import { UseQueryResult } from 'react-query';
import 'twin.macro';
import { DeleteIcon, ErrorIcon, SearchIcon } from '../../assets/Icons';
import { useAssignManyTrackingItemsToManyUsers, useJob } from '../../hooks/api/bulk';
import { trackingItemsActiveSelect, useTrackingItems } from '../../hooks/api/trackingItem';
import { CircularProgressWithLabel } from '../../lib/ui';
import { UserWithAll } from '../../repositories/userRepo';
import { BulkTrackingBodyItem } from '../../utils/bulk';
import { TrackingItemInterval } from '../../utils/daysToString';

type MassAssignResultDialogProps = {
  isOpen: {
    jobId: number;
    open: boolean;
  };
  setIsOpen: React.Dispatch<
    React.SetStateAction<{
      jobId: number;
      open: boolean;
    }>
  >;
  setSelectedUserIds: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedTrackingItemIds: React.Dispatch<React.SetStateAction<number[]>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setCompleted: React.Dispatch<
    React.SetStateAction<{
      [k: number]: boolean;
    }>
  >;
  completed: {
    [k: number]: boolean;
  };
};

const MassAssignResultInProgress = ({ job }: { job: Job }) => {
  const calculateTimeRemaining = () => {
    const { total, progress, avgProcessingTime } = job;
    const timeInMS = (total - progress) * avgProcessingTime;
    const secDiff = timeInMS / 1000; //in s
    const minDiff = timeInMS / 60 / 1000; //in minutes

    return `${Math.floor(minDiff)} min ${Math.floor(secDiff % 60)} sec`;
  };
  return (
    <div tw="flex flex-col space-y-6 items-center justify-center">
      <CircularProgressWithLabel value={(job?.progress / job?.total) * 100} />
      <Typography variant="h6" color="secondary">
        Assigning Training...
      </Typography>
      {job?.avgProcessingTime === 0 || job?.avgProcessingTime === null || !job ? (
        <Typography variant="caption" tw="text-secondarytext">
          Calculating Estimated Time
        </Typography>
      ) : (
        <Typography variant="caption" tw="text-secondarytext">
          Estimated Time: {calculateTimeRemaining()}
        </Typography>
      )}
    </div>
  );
};

type FailedResult = {
  trackingItems: TrackingItem[];
  user: UserWithAll;
};

export const MassAssignResultDialog = ({
  isOpen,
  setIsOpen,
  setSelectedUserIds,
  setSelectedTrackingItemIds,
  setStep,
  completed,
  setCompleted,
}: MassAssignResultDialogProps) => {
  const jobQuery = useJob(isOpen.jobId);
  const [failedResults, setFailedResults] = useState<FailedResult[] | null>(null);
  const retryRef = useRef({ userIds: [], trackingItemIds: [] });

  const handleRetry = () => {
    setSelectedUserIds(retryRef.current.userIds);
    setSelectedTrackingItemIds(retryRef.current.trackingItemIds);
    setIsOpen({ jobId: null, open: false });
    setCompleted({ ...completed, [2]: false });
  };

  const handleClose = () => {
    setSelectedUserIds([]);
    setSelectedTrackingItemIds([]);
    setIsOpen({ jobId: null, open: false });
    setCompleted({});
    setStep(0);
  };

  useEffect(() => {
    const retry = { userIds: [], trackingItemIds: [] };

    const resultObject = jobQuery.data?.results
      .filter((result) => result.status === JobStatus.FAILED)
      .reduce((previousValue, currentValue) => {
        if (!retry.userIds.includes(currentValue.forUserId)) {
          retry.userIds.push(currentValue.forUserId);
        }

        if (!retry.trackingItemIds.includes(currentValue.forTrackingItemId)) {
          retry.trackingItemIds.push(currentValue.forTrackingItemId);
        }

        let user = previousValue[currentValue.forUserId];

        if (!user) {
          user = {
            [currentValue.forUserId]: { trackingItems: [currentValue.forTrackingItem], user: currentValue.forUser },
          };

          return { ...previousValue, ...user };
        }

        user.trackingItems = [...user.trackingItems, currentValue.forTrackingItem];

        return { ...previousValue };
      }, {});

    retryRef.current = retry;
    setFailedResults(resultObject);
  }, [jobQuery.data]);

  return (
    <Dialog
      sx={{ paddingRight: '24rem' }}
      open={isOpen.open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="result-dialog"
    >
      <DialogContent tw="min-height[200px] flex flex-col space-y-6 py-8">
        {jobQuery.data?.status === JobStatus.WORKING ? <MassAssignResultInProgress job={jobQuery.data} /> : null}
        {jobQuery.data?.status === JobStatus.COMPLETED &&
        jobQuery.data?.results.every((result) => result.status === JobStatus.COMPLETED) ? (
          <div tw="flex flex-col justify-center items-center space-y-6">
            <Typography variant="h6" color="secondary">
              Success!
            </Typography>
            <Typography variant="caption" tw="text-secondarytext">
              The selected training has successfully been assigned!
            </Typography>
            <Button variant="contained" color="secondary" onClick={handleClose}>
              Ok
            </Button>
          </div>
        ) : null}
        {jobQuery.data?.status === JobStatus.COMPLETED &&
        jobQuery.data?.results.some((result) => result.status === JobStatus.FAILED) ? (
          <>
            <div tw="flex space-x-4 items-center justify-center">
              <ErrorIcon color="error" />
              <Typography variant="h6">Failed To Assign</Typography>
            </div>
            <Typography variant="caption" tw="text-secondarytext">
              A network error occured and training was not assigned to the following members:
            </Typography>
            <div tw="overflow-auto h-48 border rounded-md p-2">
              {failedResults &&
                Object.values(failedResults).map((result) => (
                  <div key={result.user.id} tw="pb-1">
                    <Typography variant="body1" color="red">
                      {result.user.lastName}, {result.user.firstName}
                    </Typography>
                    <div tw="pl-10">
                      {result.trackingItems.map((ti) => (
                        <Typography variant="body1" color="lightcoral" key={ti.id}>
                          {ti.title}
                        </Typography>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
            <Button variant="contained" color="secondary" onClick={handleRetry}>
              Retry
            </Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
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
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleTrackingItemIdCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const trackingItemId = parseInt(event.target.id);

    if (event.target.checked) {
      setSelectedTrackingItemIds([...selectedTrackingItemIds, trackingItemId]);
      return;
    }

    const selectedTrackingITemIdsWIthoutTrackingItemSelected = selectedTrackingItemIds.filter(
      (selectedTrackingItemId) => selectedTrackingItemId !== trackingItemId
    );
    setSelectedTrackingItemIds(selectedTrackingITemIdsWIthoutTrackingItemSelected);
  };

  const isTrackingItemChecked = (trackingItemId: number) => {
    return selectedTrackingItemIds.includes(trackingItemId);
  };

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div tw="flex-auto flex-col space-x-2 items-center">
      <div tw="flex flex-row items-center pb-5">
        <div tw="w-full pl-2">
          <TextField
            tw="bg-white rounded w-full"
            id="SearchBar"
            label="Search"
            size="small"
            value={searchTerm}
            onChange={(event) => {
              setPage(0);
              setSearchTerm(event.target.value);
            }}
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

      <div tw="border rounded-md min-height[350px]">
        <div tw="flex flex-row items-center border-b px-2">
          <FormControlLabel
            control={
              <Checkbox
                onChange={() => {
                  const allChecked = trackingItemsQuery.data?.every((ti) => isTrackingItemChecked(ti.id));
                  const tiIdsToAdd = trackingItemsQuery.data
                    ?.filter((user) => !isTrackingItemChecked(user.id))
                    .map((ti) => ti.id);
                  setSelectedTrackingItemIds(allChecked ? [] : [...selectedTrackingItemIds, ...tiIdsToAdd]);
                }}
                checked={selectedTrackingItemIds.length === trackingItemsQuery.data?.length}
                size="medium"
              />
            }
            label={
              <div tw="flex flex-row">
                <div tw="w-96 pr-6 font-bold">Item</div>
                <div tw="w-24 font-bold">Recurrence</div>
              </div>
            }
          />
        </div>
        {trackingItemsQuery?.data
          ?.filter((ti) => {
            if (searchTerm === '') {
              return true;
            }

            return ti.title.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0;
          })
          .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
          .map((ti) => (
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
                    <div tw="w-96 pr-6">{ti.title}</div>
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
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 15, 20, 25]}
            rowsPerPage={rowsPerPage}
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
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState('');

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

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div tw="flex-auto flex-col space-x-2 items-center">
      <div tw="flex flex-row items-center pb-5">
        <div tw="w-full pl-2">
          <TextField
            tw="bg-white rounded w-full"
            id="SearchBar"
            label="Search"
            size="small"
            value={searchTerm}
            onChange={(event) => {
              setPage(0);
              setSearchTerm(event.target.value);
            }}
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

      <div tw="border rounded-md min-height[350px]">
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
                <div tw="w-96 pr-6 font-bold">Name</div>
                <div tw="w-24 font-bold">Rank</div>
              </div>
            }
          />
        </div>
        {usersQuery?.data
          ?.filter((user) => {
            if (searchTerm === '') {
              return true;
            }

            return (
              user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0 ||
              user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0
            );
          })
          .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
          .map((user) => (
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
                    <div tw="w-96 pr-6">
                      {user.lastName}, {user.firstName}
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
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 15, 20, 25]}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>
    </div>
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
  setSelectedUserIds,
  selectedTrackingItemIds,
  setSelectedTrackingItemIds,
}: MassAssignReviewProps) => {
  const removeUser = (userId: number) => {
    setSelectedUserIds(selectedUserIds.filter((selectedUserId) => selectedUserId !== userId));
  };

  const removeTrackingItem = (trackingItemId: number) => {
    setSelectedTrackingItemIds(
      selectedTrackingItemIds.filter((selectedTrackingItemId) => selectedTrackingItemId !== trackingItemId)
    );
  };

  return (
    <div tw="flex flex-row space-x-5">
      <div tw="w-1/2 border rounded-md p-5">
        <Typography variant="subtitle1" tw="text-secondarytext pb-3 font-bold">
          Selected Training(s)
        </Typography>
        <div tw="overflow-auto h-[328px]">
          {trackingItemsQuery.data
            .filter((ti) => selectedTrackingItemIds.find((selectedTi) => selectedTi === ti.id))
            .map((trackingItemToAssign) => (
              <div key={trackingItemToAssign.id} tw="flex">
                <div tw="mr-auto flex flex-col space-y-1 pt-2">
                  <Typography variant="body2">{trackingItemToAssign.title}</Typography>
                  <Typography variant="body2" tw="text-disabledText">
                    {TrackingItemInterval[trackingItemToAssign.interval]}
                  </Typography>
                </div>
                <div>
                  <IconButton
                    aria-label={`delete-trackingItem-${trackingItemToAssign.id}`}
                    size="small"
                    onClick={() => removeTrackingItem(trackingItemToAssign.id)}
                    color="secondary"
                    tw="hover:bg-transparent"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div tw="w-1/2 border rounded-md p-5">
        <Typography variant="subtitle1" tw="text-secondarytext pb-3 font-bold">
          Selected Member(s)
        </Typography>
        <div tw="overflow-auto h-[328px]">
          {usersQuery.data
            .filter((user) => selectedUserIds.find((selectedUser) => selectedUser === user.id))
            .map((userToAssign) => (
              <div key={userToAssign.id} tw="flex">
                <div tw="mr-auto flex flex-col space-y-1 pt-2">
                  <Typography variant="body2">
                    {userToAssign.lastName}, {userToAssign.firstName}
                  </Typography>
                  <Typography variant="body2" tw="text-disabledText">
                    {userToAssign.rank}
                  </Typography>
                </div>
                <div>
                  <IconButton
                    aria-label={`delete-user-${userToAssign.id}`}
                    size="small"
                    onClick={() => removeUser(userToAssign.id)}
                    color="secondary"
                    tw="hover:bg-transparent"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

type MassAssignProps = {
  usersQuery: UseQueryResult<UserWithAll[]>;
};

const steps = ['Assign Training(s)', 'To Members(s)', 'Review'];

export const MassAssign = ({ usersQuery }: MassAssignProps) => {
  const trackingItemsQuery = useTrackingItems(trackingItemsActiveSelect);
  const { mutate: assign } = useAssignManyTrackingItemsToManyUsers();
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedTrackingItemIds, setSelectedTrackingItemIds] = useState<number[]>([]);
  const [step, setStep] = useState<number>(0);
  const [completed, setCompleted] = React.useState<{
    [k: number]: boolean;
  }>({});
  const [resultDialogOpen, setResultDialogOpen] = useState<{ jobId: number; open: boolean }>({
    jobId: null,
    open: false,
  });

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
        setCompleted({ ...completed, [2]: true });
        setResultDialogOpen({ jobId: response.data.id, open: true });
      },
    });
  };

  const disableButton = () => {
    return selectedUserIds.length === 0 || selectedTrackingItemIds.length === 0;
  };

  return (
    <>
      <Card tw="p-5">
        <div tw="pb-8 pt-4 flex">
          <div tw="ml-auto w-full px-8">
            <Stepper activeStep={step}>
              {steps.map((label, index) => {
                const stepProps: { completed?: boolean } = {};
                const labelProps: {
                  optional?: React.ReactNode;
                } = {};

                return (
                  <Step key={label} {...stepProps} completed={completed[index]}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </div>
        </div>

        {step === 0 ? (
          <>
            <MassAssignSelectionTrackingItems
              trackingItemsQuery={trackingItemsQuery}
              selectedTrackingItemIds={selectedTrackingItemIds}
              setSelectedTrackingItemIds={setSelectedTrackingItemIds}
            />
            <div tw="flex justify-center pt-4">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setStep(1);
                  setCompleted({ ...completed, [0]: true });
                }}
                disabled={selectedTrackingItemIds.length === 0}
                tw="w-36"
                aria-label="tracking-items-next-button"
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <MassAssignSelectionMembers
              usersQuery={usersQuery}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
            />

            <div tw="flex space-x-5 pt-4 justify-center">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setStep(0);
                  setCompleted({ ...completed, [1]: false });
                }}
                tw="w-36"
                aria-label="users-back-button"
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setStep(2);
                  setCompleted({ ...completed, [1]: true });
                }}
                disabled={selectedUserIds.length === 0}
                tw="w-36"
                aria-label="users-next-button"
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <MassAssignReview
              usersQuery={usersQuery}
              trackingItemsQuery={trackingItemsQuery}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              selectedTrackingItemIds={selectedTrackingItemIds}
              setSelectedTrackingItemIds={setSelectedTrackingItemIds}
            />
            <div tw="flex space-x-5 pt-4 justify-center">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setStep(1);
                  setCompleted({ ...completed, [2]: false });
                }}
                tw="w-36"
                aria-label="review-back-button"
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={assignTrainingItemsToUsers}
                disabled={disableButton()}
                tw="w-36"
                aria-label="review-assign-button"
              >
                Assign
              </Button>
            </div>
          </>
        ) : null}
      </Card>
      {resultDialogOpen.open ? (
        <MassAssignResultDialog
          isOpen={resultDialogOpen}
          setIsOpen={setResultDialogOpen}
          setSelectedTrackingItemIds={setSelectedTrackingItemIds}
          setSelectedUserIds={setSelectedUserIds}
          setStep={setStep}
          setCompleted={setCompleted}
          completed={completed}
        />
      ) : null}
    </>
  );
};
