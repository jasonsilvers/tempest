import { Select, MenuItem } from '@mui/material';
import { Organization, TrackingItem } from '@prisma/client';
import { useOrgsAll } from '../../hooks/api/organizations';
import { useTrackingItems, useUpdateTrackingItem } from '../../hooks/api/trackingItem';
import { LoadingSpinner, SelectChangeEvent } from '../../lib/ui';
import 'twin.macro';

type OrganizationSelectProps = {
  orgList: Organization[];
  callback: (event: SelectChangeEvent, trackingItemId: number) => void;
  trackingItemId: number;
  initOrg?: string;
};

const OrganizationSelect: React.FC<OrganizationSelectProps> = ({
  orgList,
  callback,
  trackingItemId,
  initOrg = 'none',
}) => {
  return (
    <Select
      label="Organizations"
      variant="standard"
      size="small"
      value={initOrg ? initOrg.toString() : ''}
      onChange={(event: SelectChangeEvent) => callback(event, trackingItemId)}
    >
      <MenuItem key="none" value="none">
        None
      </MenuItem>
      ;
      {orgList?.map((organization) => {
        return (
          <MenuItem key={organization.id} value={organization.id}>
            {organization.name}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export const TrackingItemsList = () => {
  const tiQuery = useTrackingItems();
  const orgQuery = useOrgsAll();
  const { mutate: updateTi } = useUpdateTrackingItem();

  const updateOrganization = (event: SelectChangeEvent, trackingItemId: number) => {
    const updatedTi: Partial<TrackingItem> = {
      id: trackingItemId,
      organizationId: event.target.value === 'none' ? null : parseInt(event.target.value),
    };

    updateTi(updatedTi);
  };

  if (tiQuery.isLoading || orgQuery.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {tiQuery.data.map((ti) => (
        <div key={ti.id} tw="flex space-x-5 p-2">
          <div>{ti.title}</div>
          <OrganizationSelect
            callback={updateOrganization}
            orgList={orgQuery.data}
            initOrg={ti.organizationId?.toString()}
            trackingItemId={ti.id}
          />
        </div>
      ))}
    </div>
  );
};
