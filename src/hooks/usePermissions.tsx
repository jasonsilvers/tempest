import { Grant } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { AccessControl } from 'accesscontrol';
import axios from 'axios';
import { useQuery } from 'react-query';
import { UserWithRole } from '../repositories/userRepo';

const usePermissions = () => {
  const { user } = useUser<UserWithRole>();

  const grantsQuery = useQuery<Grant[]>(
    'grants',
    () => axios.get('/api/grants').then((result) => result.data),
    {
      enabled: !!user,
      staleTime: Infinity,
    }
  );

  let ac: AccessControl;
  let userRole: string;

  if (grantsQuery.data) {
    ac = new AccessControl(grantsQuery.data);
    userRole = user.role.name;
  }

  return { ...grantsQuery, ac, userRole };
};

export default usePermissions;
