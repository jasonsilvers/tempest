import { Post, User } from '@prisma/client';
import axios from 'axios';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useContext } from 'react';
import { withPageAuthFor } from '../lib/p1Auth/client/server/with-page-auth';
import prisma from '../lib/prisma';
import { UserContext } from './_app';

interface IPostsProps {
  posts: Post[];
  user: User;
}

const Posts: React.FC<IPostsProps> = ({ posts, user }) => {
  // const { data: posts } = useQuery<Post[]>("posts", fetchPosts);

  const userContext = useContext(UserContext);

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <div>
        You were created: {user.createdAt.toLocaleDateString()} at{' '}
        {user.createdAt.toLocaleTimeString()}
      </div>
      {posts?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
};

//If you page depends on external data you can use:

// type Props = {
//   posts: any;
// };

//For page generation on every request

const getProp = async () => {
  console.log('This is on the server');
  const post = await prisma.post.findMany();

  return {
    props: {
      posts: post,
    },
  };
};

export const getServerSideProps = withPageAuthFor({
  getServerSideProps: getProp,
  discriminatorJWTToken: 'dodid',
  returnTo: 'http://localhost:3000/login',
  DBQueryFunctionToReturnUser: async (q):Promise<User> =>
    prisma.user.findUnique({ where: { dodId: q } }),
});

export default Posts;
