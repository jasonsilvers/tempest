import { Grant } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { AccessControl } from 'accesscontrol';
import axios from 'axios';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { UserWithRole } from '../prisma/repositories/user';

const usePermissions = () => {
  const { user } = useUser<UserWithRole>();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [ac, setAc] = useState<AccessControl | null>(null);

  const grantsQuery = useQuery<Grant[]>(
    'grants',
    () => axios.get('/api/grants').then((result) => result.data),
    {
      enabled: !!user,
      staleTime: Infinity,
      onSuccess: (grants) => {
        setUserRole(user.role.name);
        setAc(new AccessControl(grants));
      },
    }
  );

  return { ...grantsQuery, ac, userRole };
};

export default usePermissions;
