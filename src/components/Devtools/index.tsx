import { SecurityIcon } from '../../assets/Icons';
import { Fab, Drawer, Button } from '../../lib/ui';
import tw from 'twin.macro';
import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { User } from '.prisma/client';

const UsersList = () => {
  const usersListQuery = useQuery<User[]>('users', () => axios.get('/api/users').then((response) => response.data));

  if (usersListQuery.isLoading) {
    return <div>...loading users</div>;
  }

  return (
    <div tw="pl-48 pb-4">
      <div tw="text-lg pb-2 underline">Users</div>
      {usersListQuery?.data.map((user) => {
        return (
          <div key={user.id}>
            <div>
              {user.firstName} {user.lastName} - last Login: {user.lastLogin ?? 'no login'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DevDrawer = ({ showDrawer, toggleDrawer }: { showDrawer: boolean; toggleDrawer: () => void }) => {
  return (
    <>
      <Drawer anchor="bottom" open={showDrawer}>
        <div tw="ml-auto pt-2 pr-2">
          <Button size="small" variant="contained" onClick={toggleDrawer}>
            Close
          </Button>
        </div>
        <UsersList />
      </Drawer>
    </>
  );
};

const FabLayout = tw.div`fixed bottom-4 right-4`;

const Devtools = () => {
  const [showDrawer, toggleDrawer] = useState(false);

  return (
    <>
      <FabLayout>
        <Fab size="small" onClick={() => toggleDrawer((old) => !old)}>
          <SecurityIcon fontSize="small"></SecurityIcon>
        </Fab>
      </FabLayout>
      <DevDrawer showDrawer={showDrawer} toggleDrawer={() => toggleDrawer((old) => !old)} />
    </>
  );
};

export default Devtools;
