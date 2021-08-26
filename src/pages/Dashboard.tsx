import { getUsers } from '../repositories/userRepo';
import { User } from '@prisma/client';
import Link from 'next/link';
import tw from 'twin.macro';
import { useUser } from '@tron/nextjs-auth-p1';

const Header = tw.h1`text-3xl`;
const Card = tw.div`overflow-y-auto overflow-x-hidden bg-white rounded-md filter drop-shadow-md p-6`;
const UserTable = tw.div``;
const UserTableRow = tw.div``;
const UserTableColumn = tw.div``;

const CountCard = ({ variant, count }: { variant: string; count: number }) => {
  return (
    <Card tw="h-24 flex-grow">
      <h1>Overdue</h1>
      {count}
    </Card>
  );
};

const DashboardPage: React.FC<{ users: User[] }> = ({ users }) => {
  const { user: loggedInUser } = useUser<User>();

  if (!loggedInUser && !loggedInUser?.id) {
    return <p>Loading...</p>;
  }

  return (
    <main tw='pr-14 max-width[1440px] min-width[900px]'>
      <Header>Dashboard</Header>
      <div tw="flex space-x-8 pb-5">
        <CountCard variant="error" count={32}></CountCard>
        <CountCard variant="error" count={32}></CountCard>
        <CountCard variant="error" count={32}></CountCard>
        <CountCard variant="error" count={32}></CountCard>
      </div>

      <Card>
        {users.map((user) => (
          <div key={user.id} tw="text-sm mb-2">
            <Link href={`/Profile/${user.id}`}>{`${user.lastName},${user.firstName} ${
              user.id === loggedInUser.id ? '(You)' : ''
            }`}</Link>
          </div>
        ))}
      </Card>
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
