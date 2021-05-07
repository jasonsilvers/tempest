import React from 'react';
import { dehydrate } from 'react-query/hydration';
import { QueryClient, useQuery } from 'react-query';
import { fetchUsers } from '../queries/fetchUsers';
import { User } from '@prisma/client';
import { findUsers } from '../repositories/userRepo';
import { InferGetServerSidePropsType } from 'next';

export default function DashboardPage(props) {
  return (
    <main>
      <h1>Dashboard</h1>
    </main>
  );
}
