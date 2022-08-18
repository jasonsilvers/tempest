import { AppBar, Button, Card, Dialog, Slide, Toolbar, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { DataGrid, GridColumns, GridToolbar } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import tw from 'twin.macro';
import { VictoryLabel, VictoryPie } from 'victory';
import { useOrgs } from '../../hooks/api/organizations';
import { UserWithAll } from '../../repositories/userRepo';
import { removeInProgressRecords, removeOldCompletedRecords } from '../../utils';
import { getStatus } from '../../utils/status';
import { EStatus } from './Enums';
import { StatusCounts } from './Types';
import { StatusPillVariant } from './UserList';

const StatusPill = ({ variant, count }: { variant: EStatus; count: number }) => {
  return (
    <div tw="flex space-x-2 items-center">
      <div
        css={[
          StatusPillVariant[variant].color,
          StatusPillVariant[variant].textColor,
          tw`rounded-md h-4 w-4 flex items-center justify-center text-sm`,
        ]}
      ></div>
      <div>{count}</div>
    </div>
  );
};

const Transition = React.forwardRef(function Transition(
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
  const { data: orgs, isLoading } = useOrgs();

  const detailedReportData = memberList
    .filter((member) => member.memberTrackingItems.length !== 0)
    .flatMap((member) => {
      return member.memberTrackingItems
        .filter((mti) => mti.memberTrackingRecords.length !== 0)
        .flatMap((mti) => {
          return removeInProgressRecords(removeOldCompletedRecords(mti.memberTrackingRecords)).map((mtr) => {
            return {
              id: member.id,
              name: `${member.firstName} ${member.lastName}`,
              rank: member.rank,
              organizationId: member.organizationId,
              trainingTitle: mti.trackingItem.title,
              status: getStatus(mtr.completedDate, mti.trackingItem.interval),
              dueDate: dayjs(mtr.completedDate).add(mti.trackingItem.interval, 'days').format('MMM D, YYYY'),
            };
          });
        });
    });

  const columns: GridColumns = useMemo(
    () => [
      { field: 'id', headerName: 'Id', flex: 1 },
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
          return <Typography sx={{ color: 'red' }}>{params.value}</Typography>;
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
      return {
        Done: prevCount.Done + counts[nextMember.id].Done,
        Overdue: prevCount.Overdue + counts[nextMember.id].Overdue,
        Upcoming: prevCount.Upcoming + counts[nextMember.id].Upcoming,
      };
    },
    { Done: 0, Overdue: 0, Upcoming: 0 }
  );

  const memberSize = memberList?.length;

  return (
    <>
      <Card tw="h-52 relative">
        <Typography variant="h6" tw="absolute top-4 left-4">
          Readiness Stats
        </Typography>
        <div tw="flex items-center">
          <div tw="w-1/2 pl-4 flex space-x-3">
            <div tw="flex flex-col items-center">
              <Typography tw="text-secondarytext">Done</Typography>
              <StatusPill variant={EStatus.DONE} count={filteredCount?.Done} />
            </div>
            <div tw="flex flex-col items-center">
              <Typography tw="text-secondarytext">Upcoming</Typography>
              <StatusPill variant={EStatus.UPCOMING} count={filteredCount?.Upcoming} />
            </div>
            <div tw="flex flex-col items-center">
              <Typography tw="text-secondarytext">Overdue</Typography>
              <StatusPill variant={EStatus.OVERDUE} count={filteredCount?.Overdue} />
            </div>
          </div>
          <div tw="w-1/2">
            <svg height={200}>
              <VictoryPie
                colorScale={['#6FD9A6', '#FB7F7F', '#F6B83F']}
                standalone={false}
                height={200}
                width={200}
                data={[
                  { x: 'done', y: filteredCount?.Done },
                  { x: 'overdue', y: filteredCount?.Overdue },
                  { x: 'upcoming', y: filteredCount?.Upcoming },
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
