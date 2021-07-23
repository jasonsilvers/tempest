import { getUsers } from '../repositories/userRepo';
import { User } from '@prisma/client';
import Link from 'next/link';
import tw from 'twin.macro';
import { useUser } from '@tron/nextjs-auth-p1';

const Header = tw.h1`text-3xl`;

const DashboardPage: React.FC<{ users: User[] }> = ({ users }) => {
  const { user: loggedInUser } = useUser<User>();

  if (!loggedInUser && !loggedInUser?.id) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <Header>Dashboard</Header>
      {users.map((user) => (
        <div key={user.id} tw="text-sm mb-2">
          <Link href={`/Profile/${user.id}`}>{`${user.lastName},${user.firstName} ${
            user.id === loggedInUser.id ? '(You)' : ''
          }`}</Link>
        </div>
      ))}
    </main>
  );
};

export default DashboardPage;

export const getStaticProps = async () => {
  const users = await getUsers();
  return {
    props: {
      users,
    },
    revalidate: 30,
  };
};
