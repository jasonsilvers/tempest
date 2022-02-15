import React, { useMemo } from 'react';
import { Header, Link } from './Navigation';
import { Divider, TempestDrawer } from '../../lib/ui';
import { DashboardIcon, DescriptionIcon, PersonIcon, SecurityIcon } from '../../assets/Icons';
import { useQueryClient } from 'react-query';
import { usePermissions } from '../../hooks/usePermissions';
import { EFuncAction, EResource } from '../../const/enums';
import { styled } from 'twin.macro';

const SideBarDrawer = styled(TempestDrawer)`
  & .MuiDrawer-paper {
    background-color: #fff;
    width: 20rem;
    padding-top: 2.25rem;
    color: #2d2270;
    box-shadow: 2px 0px 10px 0px #00000026;
  }
`;

const Navbar: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, permissionCheck } = usePermissions();
  const canViewDashboard = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.DASHBOARD_PAGE);
  const canViewMyProfile = permissionCheck(user?.role.name, EFuncAction.READ_OWN, EResource.PROFILE_PAGE);
  const canCreateGlobalTrackingItem = permissionCheck(user?.role.name, EFuncAction.CREATE_ANY, EResource.TRACKING_ITEM);
  const canViewAdminPage = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.ADMIN_PAGE);
  const isMonitor = canViewDashboard?.granted || canCreateGlobalTrackingItem?.granted || canViewAdminPage?.granted;

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
      <Header tw="pl-6" goToUrl="/">
        Cascade
      </Header>
      <div tw="space-y-4">
        {canViewMyProfile?.granted ? (
          <div tw="pb-6 px-6">
            <Link goToUrl={`/Profile/${user.id}`} icon={<PersonIcon fontSize="large" />}>
              <div role="navigation" aria-label="my-profile">
                My Profile
              </div>
            </Link>
          </div>
        ) : null}

        {isMonitor ? (
          <>
            <Divider />
            <div tw="px-6 space-y-4">
              <h3 tw="text-[#7B7B7B]">Admin tools</h3>
              {canViewDashboard?.granted ? (
                <Link goToUrl="/Dashboard" icon={<DashboardIcon fontSize="large" />}>
                  <div role="navigation" aria-label="dashboard">
                    Dashboard
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
              {canViewAdminPage?.granted ? (
                <Link goToUrl="/Admin" icon={<SecurityIcon fontSize="large" />}>
                  <div role="navigation" aria-label="admin">
                    Admin
                  </div>
                </Link>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </SideBarDrawer>
  );
};
export default Navbar;
