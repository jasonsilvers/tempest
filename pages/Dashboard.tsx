import UserForm from "../components/UserForm"
import React, { useRef } from 'react';
import UserDebug from '../components/UserDebug'
import { dehydrate } from "react-query/hydration";
import {getUsers} from "../prisma/repositories/user"
import { QueryClient, useQuery } from "react-query";
import { fetchUsers } from "../queries/fetchUsers";
import { User } from "@prisma/client";


export default function DashboardPage() {
  const { data: users } = useQuery<User[]>('users', fetchUsers)

  return (
    <main>
      <h1>Created User</h1>
      <UserForm />
      {users.map(user => (
        <UserDebug key={user.id} user={user} />
      ))}
    </main>
  )
}

export async function getServerSideProps() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery('users', getUsers)
  
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    }
  }
}

