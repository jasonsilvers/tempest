import { Box, IconButton, Modal, Typography } from '@mui/material';
import { MemberTrackingRecord, TrackingItem, User } from '@prisma/client';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import 'twin.macro';
import { Close } from '../../../assets/Icons';
import { ECategorie, EMtrVariant } from '../../../const/enums';
import ConditionalDateInput from '../../../lib/ConditionalDateInput';
import { TrackingItemInterval } from '../../../utils/daysToString';
import { getCategory } from '../../../utils/status';
import { RecordRowActions } from '../Actions/RecordRowActions';
import { TableData, TableRow, TokenObj } from '../TwinMacro/Twin';
import { useMemberItemTrackerContext } from './providers/useMemberItemTrackerContext';

const DueDate = ({ completedDate, interval }: { completedDate: Date; interval: number }) => {
  if (interval === 0) {
    return <span>N/A</span>;
  }

  return <span>{completedDate ? dayjs(completedDate).add(interval, 'days').format('MMM D, YYYY') : 'No Date'}</span>;
};

export type RecordWithTrackingItem = MemberTrackingRecord & {
  trackingItem: TrackingItem;
  status?: ECategorie;
  authority: User;
};

const filterRecordRowByCategory = (categories: ECategorie[], activeCategory: ECategorie, status: ECategorie) => {
  if (activeCategory === ECategorie.ALL) {
    return false;
  }

  if (!categories?.includes(activeCategory)) {
    return true;
  }

  if (!categories?.includes(status)) {
    return true;
  }

  if (activeCategory !== status) {
    return true;
  }

  return false;
};

const filterRecordRowByVariant = (variant: EMtrVariant) => {
  if (variant === EMtrVariant.COMPLETED || variant === EMtrVariant.ARCHIVED) {
    return false;
  }

  if (variant === EMtrVariant.IN_PROGRESS) {
    return false;
  }

  if (variant === EMtrVariant.ALL) {
    return false;
  }

  return true;
};

const TrainingTitle = ({ title, description, location, completedDate, recurrence }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const date = dayjs(completedDate).format('MM/DD/YYYY');
  const handleModalOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleModalClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const boxStyle = {
    width: '828px',
    height: '286px',
    bgcolor: 'background.paper',
    border: '1px solid #B8B8B8',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    p: 4,
    borderRadius: '15px',
  };

  return (
    <div>
      <Typography
        tw="cursor-pointer"
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onClick={handleModalOpen}
      >
        {title}
      </Typography>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={boxStyle}>
          <IconButton
            onClick={handleModalClose}
            aria-label="dialog-close-button"
            color="secondary"
            tw="float-right justify-center"
          >
            <Close />
          </IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, fontSize: 14, color: '#00000099' }}>
            Training Description
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, fontSize: 14 }}>
            {description ? description : 'None'}
          </Typography>
          <div tw="h-2/5 flex flex-row justify-around items-center gap-6">
            <Typography tw="text-sm">
              {recurrence ? (
                <span>
                  <b>Recurrence:</b> {`${recurrence}`}
                </span>
              ) : (
                <span>
                  <b>Recurrence:</b> N/A{' '}
                </span>
              )}
            </Typography>
            <Typography tw="text-sm">
              {location ? (
                <span>
                  <b>Location:</b> {`${location}`}
                </span>
              ) : (
                <span>
                  <b>Location:</b> None
                </span>
              )}
            </Typography>
            <Typography tw="text-sm">
              {completedDate ? (
                <span>
                  <b>Completed Date:</b> {`${date}`}
                </span>
              ) : (
                <span>
                  <b>Completed Date:</b> No Date
                </span>
              )}
            </Typography>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

const RecordRow: React.FC<{
  memberTrackingRecord: MemberTrackingRecord & { trackingItem: TrackingItem; trainee: User; authority: User };
  trackingItem: TrackingItem;
}> = ({ memberTrackingRecord, trackingItem }) => {
  const { activeCategory, categories, variant } = useMemberItemTrackerContext();

  const status = useMemo(() => {
    if (memberTrackingRecord) {
      return getCategory(memberTrackingRecord, trackingItem?.interval);
    }
  }, [memberTrackingRecord, trackingItem?.interval]);

  if (filterRecordRowByCategory(categories, activeCategory, status)) {
    return null;
  }

  if (filterRecordRowByVariant(variant)) {
    return null;
  }

  const DynamicStatus = variant === EMtrVariant.ARCHIVED ? TokenObj['Archived'] : TokenObj[status];
  return (
    <>
      <TableRow>
        <TableData tw={'text-base w-1/4'}>
          <div tw={'flex'}>
            <div tw="pt-1">
              <DynamicStatus />
            </div>
            <div tw="whitespace-nowrap overflow-ellipsis overflow-hidden pt-[2px] text-secondary underline">
              <TrainingTitle
                title={trackingItem?.title}
                description={trackingItem?.description}
                location={trackingItem?.location}
                completedDate={memberTrackingRecord.completedDate}
                recurrence={TrackingItemInterval[trackingItem?.interval]}
              />
            </div>
          </div>
        </TableData>
        <TableData tw={'text-sm w-24 pt-1'}>{TrackingItemInterval[trackingItem?.interval]}</TableData>
        <div tw="flex justify-between">
          <TableData tw="flex space-x-1">
            <ConditionalDateInput memberTrackingRecord={memberTrackingRecord} />
          </TableData>
          <TableData tw="space-x-1 pt-1 text-gray-400">
            <DueDate completedDate={memberTrackingRecord.completedDate} interval={trackingItem.interval} />
          </TableData>
        </div>

        <RecordRowActions
          memberTrackingRecord={memberTrackingRecord}
          authoritySignedDate={memberTrackingRecord.authoritySignedDate}
          traineeSignedDate={memberTrackingRecord.traineeSignedDate}
          disabled={!memberTrackingRecord.completedDate}
        />
      </TableRow>
    </>
  );
};

export default RecordRow;
