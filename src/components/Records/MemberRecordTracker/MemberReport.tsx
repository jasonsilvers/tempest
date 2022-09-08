import { UserWithAll } from '../../../repositories/userRepo';
import { AppBar, Button, Card, Dialog, Toolbar, Typography } from '@mui/material';
import { Transition } from '../../Dashboard/Report';
import { DataGrid, GridColumns, GridToolbar } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { removeOldCompletedRecords } from '../../../utils';
import React, { useMemo, useState } from 'react';
import 'twin.macro';
import { VictoryLabel, VictoryPie } from 'victory';
import { getStatus } from '../../../utils/status';
import { EStatus } from '../../Dashboard/Enums';
import { StatusCounts } from '../../Dashboard/Types';
import { StatusPill, StatusDetailVariant } from '../../StatusVariants';

type MemberTrainingReportProps = {
  memberData: UserWithAll;
};

const DetailedMemberTrainingReport: React.FC<MemberTrainingReportProps> = ({ memberData }) => {
  const detailedMemberTrainingReportData = memberData?.memberTrackingItems
    .filter((member) => member.memberTrackingRecords.length !== 0)
    .flatMap((mti) => {
      return removeOldCompletedRecords(mti.memberTrackingRecords).map((mtr) => {
        const date = dayjs(mtr.completedDate).add(mti.trackingItem.interval, 'days').format('MMM D, YYYY');
        const dueDate = date === 'Invalid Date' ? 'N/A' : date;
        return {
          id: `${memberData.id}-${mtr.id}`,
          trainingTitle: mti.trackingItem.title,
          recurrence: mti.trackingItem.interval,
          status: getStatus(mtr.completedDate, mti.trackingItem.interval),
          dueDate: dueDate,
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
  memberData: UserWithAll;
  counts: StatusCounts;
};

export const MemberReport: React.FC<MemberReportProps> = ({ memberData, counts }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const filteredCount = memberData?.memberTrackingItems.reduce(
    (prevCount) => {
      const memberHasUpcomingTraining = counts[memberData.id]?.Upcoming > 0 && counts[memberData.id]?.Overdue === 0;
      const memberHasOverDueTraining = counts[memberData.id]?.Overdue > 0;
      const memberIsDone =
        counts[memberData.id]?.Upcoming === 0 &&
        counts[memberData.id]?.Overdue === 0 &&
        counts[memberData.id]?.Done > 0;
      const memberHasNoTraining =
        counts[memberData.id]?.Upcoming === 0 &&
        counts[memberData.id]?.Overdue === 0 &&
        counts[memberData.id]?.Done === 0;

      return {
        Done: prevCount.Done + (memberIsDone ? 1 : 0),
        Overdue: prevCount.Overdue + (memberHasOverDueTraining ? 1 : 0),
        Upcoming: prevCount.Upcoming + (memberHasUpcomingTraining ? 1 : 0),
        None: prevCount.None + (memberHasNoTraining ? 1 : 0),
      };
    },
    { Done: 0, Overdue: 0, Upcoming: 0, None: 0 }
  );
 
  const trainingListSize = memberData?.memberTrackingItems.length === 0 ? 'No' : memberData?.memberTrackingItems.length;

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
                text={`${trainingListSize} Trainings`}
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
            <Button variant="contained" autoFocus color="primary" onClick={handleClose}>
              Done
            </Button>
          </Toolbar>
        </AppBar>
        <div tw="p-20">
          <Card tw="h-96">
            <DetailedMemberTrainingReport memberData={memberData} />
          </Card>
        </div>
      </Dialog>
    </>
  );
};
