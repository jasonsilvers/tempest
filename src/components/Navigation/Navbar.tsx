import { Divider } from '@mui/material';
import React, { useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { styled } from 'twin.macro';
import {
  ArchiveIcon,
  AssignmentIcon,
  DashboardIcon,
  FolderSharedIcon,
  MasksIcon,
  SecurityIcon,
  SettingsIcon,
} from '../../assets/Icons';
import { EFuncAction, EResource } from '../../const/enums';
import { usePermissions } from '../../hooks/usePermissions';
import { TempestDrawer } from '../../lib/ui';
import { Header, Link } from './Navigation';

const SideBarDrawer = styled(TempestDrawer)`
  & .MuiDrawer-paper {
    background-color: #fff;
    width: 20rem;
    padding-top: 1.5rem;
    color: #2d2270;
    box-shadow: 2px 0px 10px 0px #00000026;
  }
`;

type AdminNavigationProps = {
  canViewDashboard: boolean;
  canCreateGlobalTrackingItem: boolean;
  canViewAdminPage: boolean;
};

const AdminNavigation = ({ canViewDashboard, canCreateGlobalTrackingItem, canViewAdminPage }: AdminNavigationProps) => {
  return (
    <div tw="text-secondary">
      <div tw="py-6 px-4">
        <h3 tw="text-[#7B7B7B]">Monitor tools</h3>
      </div>
      {canViewDashboard ? (
        <Link goToUrl="/Dashboard" icon={<DashboardIcon fontSize="medium" />}>
          <div role="navigation" aria-label="dashboard">
            Dashboard
          </div>
        </Link>
      ) : null}

      {canCreateGlobalTrackingItem ? (
        <Link goToUrl="/Trackingitems" icon={<AssignmentIcon fontSize="medium" />}>
          <div role="navigation" aria-label="global-training-catalog">
            Training Catalog
          </div>
        </Link>
      ) : null}
      {canViewAdminPage ? (
        <Link goToUrl="/Admin" icon={<SecurityIcon fontSize="medium" />}>
          <div role="navigation" aria-label="admin">
            Admin
          </div>
        </Link>
      ) : null}
    </div>
  );
};

const Navbar: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, permissionCheck } = usePermissions();

  const canViewMyProfile = permissionCheck(user?.role?.name, EFuncAction.READ_OWN, EResource.PROFILE_PAGE);
  const canCreateGlobalTrackingItem = permissionCheck(
    user?.role?.name,
    EFuncAction.CREATE_ANY,
    EResource.TRACKING_ITEM
  );
  const canViewAdminPage = permissionCheck(user?.role?.name, EFuncAction.READ_ANY, EResource.ADMIN_PAGE);
  const canViewDashboard = permissionCheck(user?.role?.name, EFuncAction.READ_ANY, EResource.DASHBOARD_PAGE);
  const isAdmin = canCreateGlobalTrackingItem?.granted || canViewAdminPage?.granted || canViewDashboard?.granted;

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
      <Header tw="flex content-center items-center flex-col" goToUrl="/">
        <img height="86" width="60" alt="Cascade Welcome Image" tw="" src="/cascadelogo.svg" />
      </Header>
      <div tw="text-secondary">
        {canViewMyProfile?.granted ? (
          <>
            <Link goToUrl={`/Profile/${user.id}`} icon={<FolderSharedIcon fontSize="medium" />}>
              <div role="navigation" aria-label="training-record">
                Training Record
              </div>
            </Link>
            <Link goToUrl={`/Profile/${user.id}/Archive`} icon={<ArchiveIcon fontSize="medium" />}>
              <div role="navigation" aria-label="training-record-archive">
                Archive
              </div>
            </Link>
            <Link goToUrl={`/Ppe/${user.id}`} icon={<MasksIcon fontSize="medium" />}>
              <div role="navigation" aria-label="ppe">
                Personal Protection Equipment
              </div>
            </Link>

            <Link goToUrl={`/Account`} icon={<SettingsIcon fontSize="medium" />}>
              <div role="navigation" aria-label="account-settings">
                Account Settings
              </div>
            </Link>
          </>
        ) : null}

        {isAdmin ? (
          <>
            <Divider light />
            <AdminNavigation
              canCreateGlobalTrackingItem={canCreateGlobalTrackingItem.granted}
              canViewAdminPage={canViewAdminPage.granted}
              canViewDashboard={canViewDashboard.granted}
            />
          </>
        ) : null}
      </div>
    </SideBarDrawer>
  );
};
export default Navbar;
