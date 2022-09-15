import { IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import { useQueryClient } from 'react-query';
import { MoreHorizIcon } from '../../assets/Icons';
import { EMtrVariant } from '../../const/enums';
import { mtiQueryKeys } from '../../hooks/api/memberTrackingItem';
import { fetchMemberTrackingItems } from '../../hooks/api/users';

export default function DashboardPopMenu({ userId }: { userId: number }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const queryClient = useQueryClient();

  const prefetchUserTrainingRecord = (userIdToFetch: number) => {
    queryClient.prefetchQuery(
      mtiQueryKeys.memberTrackingItems(userIdToFetch, EMtrVariant.IN_PROGRESS),
      () => fetchMemberTrackingItems(userIdToFetch, EMtrVariant.IN_PROGRESS),
      {
        staleTime: 5000,
      }
    );

    queryClient.prefetchQuery(
      mtiQueryKeys.memberTrackingItems(userIdToFetch, EMtrVariant.COMPLETED),
      () => fetchMemberTrackingItems(userIdToFetch, EMtrVariant.COMPLETED),
      {
        staleTime: 5000,
      }
    );
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    prefetchUserTrainingRecord(userId);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton aria-label={`member-popup-menu`} size="small" onClick={handleClick} tw="hover:bg-transparent">
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem aria-label="view-member-profile" onClick={handleClose}>
          <span onClick={() => router.push(`/Profile/${userId}`)}>Training Record</span>
        </MenuItem>
        <MenuItem aria-label="view-member-profile-archive" onClick={handleClose}>
          <span onClick={() => router.push(`/Profile/${userId}/Archive`)}>Archives</span>
        </MenuItem>
        <MenuItem aria-label="view-member-ppe" onClick={handleClose}>
          <span onClick={() => router.push(`/Ppe/${userId}`)}>View PPE</span>
        </MenuItem>
      </Menu>
    </div>
  );
}
