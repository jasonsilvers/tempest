import { Button, Card, Checkbox, Dialog, Divider, TextField, Typography } from '@mui/material';
import { MemberTrackingItemStatus, PersonalProtectionEquipmentItem } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
import React, { ForwardedRef, useState } from 'react';
import 'twin.macro';
import { VictoryLabel, VictoryPie } from 'victory';
import { TrackingItemInterval } from '../../../../src/utils/daysToString';
import { usePpeItems } from '../../../hooks/api/ppe';
import { useMemberTrackingItemsForUser } from '../../../hooks/api/users';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
import { LoggedInUser, UserWithAll } from '../../../repositories/userRepo';
import { removeInProgressRecords, removeOldCompletedRecords } from '../../../utils';
import { EStatus } from '../../Dashboard/Enums';
import { Transition } from '../../Dashboard/Report';
import { addMemberCounts } from '../../Reports/reportsUtils';
import { StatusPill } from '../../StatusVariants';
import ReactToPrint from 'react-to-print';

type FilteredMTR = {
  id: string;
  trainingTitle: string;
  recurrence: string;
  completed: string;
  dueDate: string;
  trainer: string;
  member: string;
  trainerSignedDate: string;
  memberSignedDate: string;
};

type PrintMemberReportType = {
  user: UserWithAll;
  ppeItems: PersonalProtectionEquipmentItem[];
  mtrs: FilteredMTR[];
};

const PrintMemberReport = ({ user, ppeItems, mtrs }: PrintMemberReportType, ref: ForwardedRef<HTMLDivElement>) => {
  return (
    <div ref={ref} tw="p-10">
      <div tw="h-32 flex">
        <img alt="Cascade logo without text" tw="h-32 w-28" src="/img/cascade_logo_no_text.svg" />
        <div tw="flex flex-col self-end">
          <img alt="Cascade logo without text" tw="h-8 w-24" src="/img/cascade_logo_text.svg" />
          <Typography variant="overline" color="primary" fontSize={16}>
            safety and health training record
          </Typography>
        </div>
      </div>
      <div tw="py-10">
        <Divider variant="fullWidth" tw="w-[1200px]" />
      </div>
      <div tw="flex flex-col w-[1200px]">
        <div tw="flex space-x-6">
          <TextField
            id="outlined-helperText"
            label="Name"
            variant="standard"
            value={`${user?.firstName} ${user?.lastName}`}
            fullWidth
          />
          <TextField
            id="outlined-helperText"
            label="Rank"
            variant="standard"
            value={user?.rank ? user?.rank : 'No Rank'}
            fullWidth
          />
          <TextField
            id="outlined-helperText"
            label="Job Code/AFSC"
            variant="standard"
            value={user.afsc ? user.afsc : 'No AFSC'}
            fullWidth
          />
        </div>
        <div tw="flex space-x-6 pt-4">
          <TextField
            id="outlined-helperText"
            label="Organization"
            variant="standard"
            value={user.organization.name ? user.organization.name : 'No Organization'}
            fullWidth
          />
          <TextField
            id="outlined-helperText"
            label="Duty Title"
            variant="standard"
            value={user.dutyTitle ? user.dutyTitle : 'No Duty Title'}
            fullWidth
          />
        </div>
      </div>

      <div tw="pt-10">
        <Typography variant="overline" color="primary" fontSize={16}>
          personal protective equipment
        </Typography>
        {ppeItems?.length > 0 ? (
          <div tw="grid grid-cols-12 gap-1 text-[14px] font-bold w-[1200px] pb-4">
            <div tw="p-1 col-span-10 rounded-lg">Title</div>
            <div tw="p-1 col-span-1 rounded-lg text-center">Provided</div>
            <div tw="p-1 col-span-1 rounded-lg text-center">In-Use</div>
          </div>
        ) : (
          <div>No Items</div>
        )}
        {ppeItems?.map((ppeItem) => (
          <>
            <Divider variant="fullWidth" tw="w-[1200px]" />
            <div key={ppeItem.id} tw="grid grid-cols-12 gap-1 text-[14px] w-[1200px] p-1 items-center">
              <div tw="p-1 col-span-10 rounded-lg">{ppeItem.name}</div>
              <div tw="p-1 col-span-1 rounded-lg text-center">
                <Checkbox
                  inputProps={{ 'aria-label': 'checkbox-provided' }}
                  checked={ppeItem.inUse}
                  color="secondary"
                />
              </div>
              <div tw="p-1 col-span-1 rounded-lg text-center">
                <Checkbox
                  inputProps={{ 'aria-label': 'checkbox-provided' }}
                  checked={ppeItem.provided}
                  color="secondary"
                />
              </div>
            </div>
          </>
        ))}
        <div tw="pt-10">
          <Typography variant="overline" color="primary" fontSize={16}>
            training record
          </Typography>
          {mtrs.length > 0 ? (
            <div tw="grid grid-cols-12 text-[14px] font-bold w-[1200px] pb-4">
              <div tw="p-1 col-span-5 rounded-lg">Title</div>
              <div tw="p-1 col-span-1 rounded-lg">Recurrence</div>
              <div tw="p-1 col-span-1 rounded-lg">Completed</div>
              <div tw="p-1 col-span-1 rounded-lg">Due</div>
              <div tw="p-1 col-span-2 rounded-lg text-center">Trainer</div>
              <div tw="p-1 col-span-2 rounded-lg text-center">Member</div>
            </div>
          ) : (
            <div>No Records</div>
          )}
          {mtrs.map((mtr) => (
            <>
              <Divider variant="fullWidth" tw="w-[1200px]" />
              <div key={mtr.id} tw="grid grid-cols-12 text-[14px] w-[1200px] p-1 items-center">
                <div tw="p-1 col-span-5 rounded-lg">{mtr.trainingTitle}</div>
                <div tw="p-1 col-span-1 rounded-lg">{mtr.recurrence}</div>
                <div tw="p-1 col-span-1 rounded-lg">{mtr.completed}</div>
                <div tw="p-1 col-span-1 rounded-lg">{mtr.dueDate}</div>
                <div tw="p-1 col-span-2 rounded-lg flex flex-col items-center">
                  <div>{mtr.trainer}</div>
                  <div>{mtr.trainerSignedDate}</div>
                </div>
                <div tw="p-1 col-span-2 rounded-lg flex flex-col items-center">
                  <div>{mtr.member}</div>
                  <div>{mtr.memberSignedDate}</div>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

const PrintableMemberReport = React.forwardRef(PrintMemberReport);

type ExportDialogProps = {
  open: boolean;
  handleClose: () => void;
  member: UserWithAll;
  memberTrackingItems: MemberTrackingItemWithAll[];
};

const ExportDialog: React.FC<ExportDialogProps> = ({ open, handleClose, member, memberTrackingItems }) => {
  const componentRef = React.useRef();
  const ppeQuery = usePpeItems(member?.id);

  const filteredMTRs = memberTrackingItems
    ?.filter((memberFilter) => memberFilter.memberTrackingRecords.length !== 0)
    .flatMap((mti) => {
      return removeOldCompletedRecords(removeInProgressRecords(mti.memberTrackingRecords)).map((mtr) => {
        return {
          id: `${member.id}-${mtr.id}`,
          trainingTitle: mti.trackingItem.title,
          recurrence: TrackingItemInterval[mti.trackingItem.interval],
          completed: dayjs(mtr.completedDate).format('MMM D, YYYY'),
          dueDate: dayjs(mtr.completedDate).add(mti.trackingItem.interval, 'days').format('MMM D, YYYY'),
          trainer: `${mtr.authority?.firstName} ${mtr.authority?.lastName}`,
          trainerSignedDate: `${dayjs(mtr.authoritySignedDate).format('HH:MM MMM D, YYYY')}`,
          member: `${mtr.trainee?.firstName} ${mtr.trainee?.lastName}`,
          memberSignedDate: `${dayjs(mtr.traineeSignedDate).format('HH:MM MMM D, YYYY')}`,
        };
      });
    });

  if (ppeQuery.isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { backgroundColor: '#f8f8f8' } }}
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <div tw="mr-auto ml-auto relative w-[1200px]">
        <div tw="absolute top-6 right-6 flex space-x-6">
          <ReactToPrint
            trigger={() => <Button variant="contained">Print</Button>}
            content={() => componentRef.current}
          />
          <Button variant="outlined" onClick={handleClose}>
            Close
          </Button>
        </div>

        <PrintableMemberReport ref={componentRef} user={member} ppeItems={ppeQuery.data} mtrs={filteredMTRs} />
      </div>
    </Dialog>
  );
};

type MemberReportProps = {
  member: UserWithAll;
};

export const MemberReport: React.FC<MemberReportProps> = ({ member }) => {
  const [openExport, setOpenExport] = useState(false);
  const memberTrackingItemsQuery = useMemberTrackingItemsForUser(member?.id);

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
          <Button variant="outlined" onClick={() => setOpenExport(true)}>
            Export
          </Button>
        </div>
      </Card>
      <ExportDialog
        open={openExport}
        handleClose={() => setOpenExport(false)}
        member={member}
        memberTrackingItems={memberTrackingItemsQuery?.data}
      />
    </>
  );
};
