import React, { useMemo } from 'react';
import { Header, Link } from './Navigation';
import { TempestDrawer } from '../../lib/ui';
import { DashboardIcon, DescriptionIcon, PersonIcon, SecurityIcon } from '../../assets/Icons';
import { useQueryClient } from 'react-query';
import { usePermissions } from '../../hooks/usePermissions';
import { EFuncAction, EResource } from '../../const/enums';
import { styled } from 'twin.macro';

const SideBarDrawer = styled(TempestDrawer)`
  & .MuiDrawer-paper {
    background-color: #fff;
    width: 16rem;
    padding-left: 1.5rem;
    padding-top: 2.25rem;
    color: #2d2270;
  }
`;

const Navbar: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, permissionCheck } = usePermissions();
  const canViewDashboard = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.DASHBOARD_PAGE);
  const canViewMyProfile = permissionCheck(user?.role.name, EFuncAction.READ_OWN, EResource.PROFILE_PAGE);
  const canCreateGlobalTrackingItem = permissionCheck(user?.role.name, EFuncAction.CREATE_ANY, EResource.TRACKING_ITEM);
  const canViewAdminPage = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.ADMIN_PAGE);

  useMemo(() => {
    if (user) {
      queryClient.setQueryData('loggedInUser', user);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <SideBarDrawer>
      <Header goToUrl="/">Cascade</Header>
      <div tw="space-y-4">
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
              Training List
            </div>
          </Link>
        ) : null}
        {canViewAdminPage?.granted ? (
          <Link goToUrl="/Admin" icon={<SecurityIcon fontSize="large" />}>
            <div role="navigation" aria-label="admin">
              Admin
            </div>
          </Link>
        ) : null}
      </div>
    </SideBarDrawer>
  );
};
export default Navbar;
