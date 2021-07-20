import { getUsers } from '../repositories/userRepo';
import { User } from '@prisma/client';
import Link from 'next/link';

const DashboardPage: React.FC<{ users: User[] }> = ({ users }) => {
  return (
    <main>
      <h1>Dashboard</h1>
      {users.map((user) => (
        <Link key={user.id} href={`/Profile/${user.id}`}>
          {`${user.lastName},${user.firstName}`}
        </Link>
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
