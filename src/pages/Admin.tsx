import React from 'react';
import { Devtools } from '../components/Devtools';
import { EFuncAction, EResource } from '../const/enums';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../lib/ui';
import 'twin.macro';

function AdminPage() {
  const { user, permissionCheck, isLoading } = usePermissions();

  const canViewAdminPage = permissionCheck(user?.role.name, EFuncAction.READ_ANY, EResource.ADMIN_PAGE);

  if (isLoading) {
    return <div>...loading</div>;
  }

  if (!canViewAdminPage?.granted) {
    return <div>You do not have access to this page</div>;
  }
  return (
    <main tw="pr-14 min-width[1024px]">
      <Card>
        <Devtools />
      </Card>
    </main>
  );
}

export default AdminPage;
