import { Post, User } from '@prisma/client';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { withPageAuth } from '../lib/p1Auth';
import prisma from '../prisma/prisma';

interface IPostsProps {
  posts: Post[];
  user: User;
}

const Posts: React.FC<IPostsProps> = ({ posts, user }) => {
  // const { data: posts } = useQuery<Post[]>("posts", fetchPosts);

  console.log(user);

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

//For page generation on every request

const getProp: GetServerSideProps = async () => {
  const post = await prisma.post.findMany();

  return {
    props: {
      posts: post,
    },
  };
};

export const getServerSideProps = withPageAuth({
  getServerSideProps: getProp,
  returnTo: 'http://localhost:3000/login',
  DBQueryFunctionToReturnUser: async (query): Promise<User> =>
    prisma.user.findUnique({ where: { dodId: query } }),
});

export default Posts;
