import { AppBar, Button, Card, Dialog, Toolbar, Typography } from '@mui/material';
import { DataGrid, GridColumns, GridToolbar } from '@mui/x-data-grid';
import { MemberTrackingItemStatus } from '@prisma/client';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import 'twin.macro';
import { VictoryLabel, VictoryPie } from 'victory';
import { useMemberTrackingItemsForUser } from '../../../hooks/api/users';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
import { removeInProgressRecords, removeOldCompletedRecords } from '../../../utils';
import { getStatus } from '../../../utils/status';
import { EStatus } from '../../Dashboard/Enums';
import { Transition } from '../../Dashboard/Report';
import { addMemberCounts } from '../../Reports/reportsUtils';
import { StatusDetailVariant, StatusPill } from '../../StatusVariants';
import { TrackingItemInterval } from '../../../../src/utils/daysToString';

type MemberTrainingReportProps = {
  memberId: number;
  memberTrackingItems: MemberTrackingItemWithAll[];
};

const DetailedMemberTrainingReport: React.FC<MemberTrainingReportProps> = ({ memberId, memberTrackingItems }) => {
  const detailedMemberTrainingReportData = memberTrackingItems
    ?.filter((member) => member.memberTrackingRecords.length !== 0)
    .flatMap((mti) => {
      return removeOldCompletedRecords(removeInProgressRecords(mti.memberTrackingRecords)).map((mtr) => {
        return {
          id: `${memberId}-${mtr.id}`,
          trainingTitle: mti.trackingItem.title,
          recurrence: TrackingItemInterval[mti.trackingItem.interval],
          status: getStatus(mtr.completedDate, mti.trackingItem.interval),
          dueDate: dayjs(mtr.completedDate).add(mti.trackingItem.interval, 'days').format('MMM D, YYYY'),
        };
      });
    });

  const columns: GridColumns = useMemo(
    () => [
      { field: 'trainingTitle', headerName: 'Training Title', flex: 1 },
      { field: 'recurrence', headerName: 'Recurrence', flex: 1 },
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
  return (
    <DataGrid
      components={{ Toolbar: GridToolbar }}
      rows={detailedMemberTrainingReportData}
      columns={columns}
      disableVirtualization
      disableSelectionOnClick
    />
  );
};
type MemberReportProps = {
  memberId: number;
};

export const MemberReport: React.FC<MemberReportProps> = ({ memberId }) => {
  const [open, setOpen] = useState(false);
  const memberTrackingItemsQuery = useMemberTrackingItemsForUser(memberId);

  const counts = {
    Done: 0,
    Overdue: 0,
    Upcoming: 0,
    All: 0,
  };

  memberTrackingItemsQuery.data
    ?.filter((mti) => mti.status === MemberTrackingItemStatus.ACTIVE)
    .forEach((mti) => {
      const filteredMtrs = removeInProgressRecords(removeOldCompletedRecords(mti.memberTrackingRecords));
      filteredMtrs.forEach((mtr) => {
        counts.All = counts.All + 1;
        addMemberCounts(mti, mtr, counts);
      });
    });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (memberTrackingItemsQuery.isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <>
      <Card data-testid="report-widget" tw="h-60 relative">
        <Typography variant="h6" tw="absolute top-4 left-4">
          Readiness Stats
        </Typography>
        <div tw="flex items-center">
          <div tw="w-1/2 pl-4 flex space-x-4">
            <div data-testid="report-done" tw="flex flex-col items-start">
              <Typography tw="text-secondarytext" fontSize={14}>
                Done
              </Typography>
              <StatusPill variant={EStatus.DONE} count={counts?.Done} />
            </div>
            <div data-testid="report-upcoming" tw="flex flex-col items-start">
              <Typography tw="text-secondarytext" fontSize={14}>
                Upcoming
              </Typography>
              <StatusPill variant={EStatus.UPCOMING} count={counts?.Upcoming} />
            </div>
            <div data-testid="report-overdue" tw="flex flex-col items-start">
              <Typography tw="text-secondarytext" fontSize={14}>
                Overdue
              </Typography>
              <StatusPill variant={EStatus.OVERDUE} count={counts?.Overdue} />
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
                  { x: 'done', y: counts?.Done },
                  { x: 'overdue', y: counts?.Overdue },
                  { x: 'upcoming', y: counts?.Upcoming },
                  { x: 'none', y: counts?.All === 0 },
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
                text={`${counts.All} Trainings`}
              />
            </svg>
          </div>
        </div>
        <div tw="absolute bottom-4 left-4">
          <Button variant="outlined" onClick={handleClickOpen}>
            Reporting Excel
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
              Reporting Excel
            </Typography>
            <Button variant="contained" size="small" autoFocus color="primary" onClick={handleClose}>
              Done
            </Button>
          </Toolbar>
        </AppBar>
        <div tw="p-20">
          <Card tw="h-96">
            {<DetailedMemberTrainingReport memberId={memberId} memberTrackingItems={memberTrackingItemsQuery.data} />}
          </Card>
        </div>
      </Dialog>
    </>
  );
};
