import { User } from '@prisma/client';
import { withPageAuth } from '../lib/p1Auth';
import { useUser } from '../lib/p1Auth/client/UserContextProvider';

const Profile = () => {
  const { user, isLoading } = useUser<User>();

  console.log('process ' + process.env.P1_AUTH_LOGIN_ENDPOINT);

  if (isLoading) {
    return (
      <div>Loading</div>
    )
  }

  return (
    <div>
      <div>Your Profile Mr. {user?.name}</div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default withPageAuth(Profile);
