import { AppBar, Button, Card, Dialog, Slide, Toolbar, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { DataGrid, GridColumns, GridToolbar } from '@mui/x-data-grid';
import { MemberTrackingItemStatus } from '@prisma/client';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import tw from 'twin.macro';
import { VictoryLabel, VictoryPie } from 'victory';
import { useOrgsLoggedInUsersOrgAndDown } from '../../hooks/api/organizations';
import { UserWithAll } from '../../repositories/userRepo';
import { removeInProgressRecords, removeOldCompletedRecords } from '../../utils';
import { getStatus } from '../../utils/status';
import { EStatus } from './Enums';
import { StatusCounts } from './Types';
import { StatusPillVariant } from './UserList';

export const StatusDetailVariant = {
  Done: {
    textColor: tw`text-[#6FD9A6]`,
  },
  Overdue: {
    textColor: tw`text-[#FB7F7F]`,
  },
  Upcoming: {
    textColor: tw`text-[#F6B83F]`,
  },
  Archived: {
    textColor: tw`text-gray-500`,
  },
};

const StatusPill = ({ variant, count }: { variant: EStatus; count: number }) => {
  return (
    <div tw="flex space-x-2 items-center">
      <div
        css={[
          StatusPillVariant[variant].color,
          StatusPillVariant[variant].textColor,
          tw`rounded-sm h-3 w-3 flex items-center justify-center text-sm`,
        ]}
      ></div>
      <Typography fontSize={14}>{count}</Typography>
    </div>
  );
};

export const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type DetailedReportProps = {
  memberList: UserWithAll[];
};

const DetailedReport: React.FC<DetailedReportProps> = ({ memberList }) => {
  const { data: orgs, isLoading } = useOrgsLoggedInUsersOrgAndDown();

  const detailedReportData = memberList
    .filter((member) => member.memberTrackingItems.length !== 0)
    .flatMap((member) => {
      return member.memberTrackingItems
        .filter((mti) => mti.memberTrackingRecords.length !== 0)
        .flatMap((mti) => {
          return removeInProgressRecords(removeOldCompletedRecords(mti.memberTrackingRecords)).map((mtr) => {
            const isInactive = mti.status === MemberTrackingItemStatus.INACTIVE;

            return {
              id: `${member.id}-${mtr.id}`,
              name: `${member.firstName} ${member.lastName}`,
              rank: member.rank,
              organizationId: member.organizationId,
              trainingTitle: mti.trackingItem.title,
              status: isInactive ? 'Archived' : getStatus(mtr.completedDate, mti.trackingItem.interval),
              dueDate: dayjs(mtr.completedDate).add(mti.trackingItem.interval, 'days').format('MMM D, YYYY'),
            };
          });
        });
    });

  const columns: GridColumns<typeof detailedReportData[number]> = useMemo(
    () => [
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'rank', headerName: 'Rank', flex: 1 },
      {
        field: 'organizationId',
        headerName: 'Organization',
        flex: 1,
        valueGetter: (params) => {
          return orgs?.find((org) => org.id === params.value)?.name;
        },
      },
      { field: 'trainingTitle', headerName: 'Training Title', flex: 1 },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        renderCell: (params) => {
          return <Typography sx={{ color: StatusDetailVariant[params.value].textColor }}>{params.value}</Typography>;
        },
      },
      { field: 'dueDate', headerName: 'Due Date', flex: 1 },
    ],
    []
  );

  if (isLoading) {
    return <Typography>...Loading</Typography>;
  }

  return (
    <DataGrid
      components={{ Toolbar: GridToolbar }}
      rows={detailedReportData}
      columns={columns}
      disableVirtualization
      disableSelectionOnClick
    />
  );
};

type ReportProps = {
  memberList: UserWithAll[];
  counts: StatusCounts;
};

export const Report: React.FC<ReportProps> = ({ memberList, counts }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const filteredCount = memberList?.reduce(
    (prevCount, nextMember) => {
      const memberHasUpcomingTraining = counts[nextMember.id].Upcoming > 0 && counts[nextMember.id].Overdue === 0;
      const memberHasOverDueTraining = counts[nextMember.id].Overdue > 0;
      const memberIsDone =
        counts[nextMember.id].Upcoming === 0 && counts[nextMember.id].Overdue === 0 && counts[nextMember.id].Done > 0;
      const memberHasNoTraining =
        counts[nextMember.id].Upcoming === 0 && counts[nextMember.id].Overdue === 0 && counts[nextMember.id].Done === 0;
      return {
        Done: prevCount.Done + (memberIsDone ? 1 : 0),
        Overdue: prevCount.Overdue + (memberHasOverDueTraining ? 1 : 0),
        Upcoming: prevCount.Upcoming + (memberHasUpcomingTraining ? 1 : 0),
        None: prevCount.None + (memberHasNoTraining ? 1 : 0),
      };
    },
    { Done: 0, Overdue: 0, Upcoming: 0, None: 0 }
  );

  const memberSize = memberList?.length;

  return (
    <>
      <Card data-testid="report-widget" tw="h-52 relative">
        <Typography variant="h6" tw="absolute top-4 left-4">
          Readiness Stats
        </Typography>
        <div tw="flex items-center">
          <div tw="w-1/2 pl-4 flex space-x-4">
            <div data-testid="report-done" tw="flex flex-col items-start">
              <Typography tw="text-secondarytext" fontSize={14}>
                Done
              </Typography>
              <StatusPill variant={EStatus.DONE} count={filteredCount?.Done} />
            </div>
            <div data-testid="report-upcoming" tw="flex flex-col items-start">
              <Typography tw="text-secondarytext" fontSize={14}>
                Upcoming
              </Typography>
              <StatusPill variant={EStatus.UPCOMING} count={filteredCount?.Upcoming} />
            </div>
            <div data-testid="report-overdue" tw="flex flex-col items-start">
              <Typography tw="text-secondarytext" fontSize={14}>
                Overdue
              </Typography>
              <StatusPill variant={EStatus.OVERDUE} count={filteredCount?.Overdue} />
            </div>
          </div>
          <div tw="w-1/2">
            <svg height={200}>
              <VictoryPie
                colorScale={['#6FD9A6', '#FB7F7F', '#F6B83F', 'lightgrey']}
                standalone={false}
                height={200}
                width={200}
                data={[
                  { x: 'done', y: filteredCount?.Done },
                  { x: 'overdue', y: filteredCount?.Overdue },
                  { x: 'upcoming', y: filteredCount?.Upcoming },
                  { x: 'none', y: filteredCount?.None },
                ]}
                innerRadius={65}
                labelRadius={100}
                labelComponent={<span></span>}
                style={{ labels: { fontSize: 20, fill: 'white' } }}
              />
              <VictoryLabel
                textAnchor="middle"
                style={{ fontSize: 14 }}
                x={100}
                y={100}
                text={`${memberSize} members`}
              />
            </svg>
          </div>
        </div>
        <div tw="absolute bottom-4 left-4">
          <Button variant="outlined" onClick={handleClickOpen}>
            Detailed Report
          </Button>
        </div>
      </Card>
      <Dialog
        sx={{ '& .MuiDialog-paper': { backgroundColor: '#f8f8f8' } }}
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative', backgroundColor: 'white' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div" color="primary">
              Detailed Report
            </Typography>
            <Button variant="contained" autoFocus color="primary" onClick={handleClose}>
              Done
            </Button>
          </Toolbar>
        </AppBar>
        <div tw="p-20">
          <Card tw="h-96">
            <DetailedReport memberList={memberList} />
          </Card>
        </div>
      </Dialog>
    </>
  );
};
