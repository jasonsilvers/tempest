import React, { useMemo } from 'react';
import { Header, Link } from './Navigation';
import { TempestDrawer } from '../../lib/ui';
import { DashboardIcon, DescriptionIcon, PersonIcon } from '../../assets/Icons';
import { useQueryClient } from 'react-query';
import { usePermissions } from '../../hooks/usePermissions';
import { EFuncAction, EResource } from '../../const/enums';

const Navbar: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, permissionCheck } = usePermissions();
  const canViewDashboard = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.DASHBOARD);
  const canViewMyProfile = permissionCheck(user?.role.name, EFuncAction.READ_OWN, EResource.PROFILE);
  const canCreateGlobalTrackingItem = permissionCheck(user?.role.name, EFuncAction.CREATE_ANY, EResource.TRACKING_ITEM);

  useMemo(() => {
    if (user) {
      queryClient.setQueryData('loggedInUser', user);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <TempestDrawer>
      <Header goToUrl="/">Cascade</Header>
      <div tw="space-y-9">
        {canViewDashboard?.granted ? (
          <Link goToUrl="/Dashboard" icon={<DashboardIcon fontSize="large" />}>
            <div role="navigation" aria-label="dashboard">
              Dashboard
            </div>
          </Link>
        ) : null}
        {canViewMyProfile?.granted ? (
          <Link goToUrl={`/Profile/${user.id}`} icon={<PersonIcon fontSize="large" />}>
            <div role="navigation" aria-label="my-profile">
              My Profile
            </div>
          </Link>
        ) : null}
        {canCreateGlobalTrackingItem?.granted ? (
          <Link goToUrl="/Trackingitems" icon={<DescriptionIcon fontSize="large" />}>
            <div role="navigation" aria-label="global-training-catalog">
              Global Training Catalog
            </div>
          </Link>
        ) : null}
      </div>
    </TempestDrawer>
  );
};
export default Navbar;
