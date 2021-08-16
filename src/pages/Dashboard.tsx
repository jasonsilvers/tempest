import { getUsers } from '../repositories/userRepo';
import { User } from '@prisma/client';
import Link from 'next/link';
import tw from 'twin.macro';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Header = tw.h1`text-3xl`;

const DashboardPage: React.FC<{ users: User[] }> = ({ users }) => {
  const { user: loggedInUser } = useUser<User>();
  const router = useRouter();

  useEffect(() => {
    // Prefetch the dashboard page
    router.prefetch(`/profile/${loggedInUser?.id}`);
  }, []);

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
  try {
    return {
      props: {
        users: await getUsers(),
      },
      revalidate: 60,
    };
  } catch (e) {
    return {
      props: {
        users: [],
      },
      revalidate: 60,
    };
  }
};
