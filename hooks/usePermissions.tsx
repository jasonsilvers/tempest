import { useUser } from '@tron/nextjs-auth-p1';
import { AccessControl } from 'accesscontrol';
import axios from 'axios';
import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { UserWithRole } from '../prisma/repositories/user';
import { Role } from '../types/global';

const usePermissions = () => {
  const { user } = useUser<UserWithRole>();

  const grantsQuery = useQuery(
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
    userRole = user.role.name;
    ac = new AccessControl(grantsQuery.data);
  }

  return { ...grantsQuery, ac, userRole };
};

export default usePermissions;
