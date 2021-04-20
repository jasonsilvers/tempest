import React from 'react';
import { User }from '@prisma/client';

type Props = {
  user: User
  deleteUser?: (id: number) => void
}

const UserDebug: React.FC<Props> = ({user}) => {
  return (
    <div>
      <div>
        <p >{user.firstName}</p>
        <p>{user.lastName}</p>
        <p>{user.dodId}</p>
      </div>
    </div>
  )
}

export default UserDebug
