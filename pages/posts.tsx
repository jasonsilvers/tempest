import { InferGetStaticPropsType } from 'next';

import prisma from '../prisma/prisma';

function Posts(props: InferGetStaticPropsType<typeof getStaticProps>) {
  // const { data: posts } = useQuery<Post[]>("posts", fetchPosts);

  console.log('Props: ' + props);

  return (
    <div>
      <h1>Posts on another page with hydration</h1>
      {props.posts?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

//If you page depends on external data you can use:

type Props = {
  posts: any;
};

//For page generation on every request

// export const getServerSideProps = withPageAuth(async () => {

//   console.log('This is on the server')
//   const post = await prisma.post.findMany()

//   return {
//     props: {
//       posts: post
//     },
//   };
// })

export const getStaticProps = async () => {
  const posts = await prisma.post.findMany();

  return {
    props: {
      posts,
    },
  };
};

export default Posts;
// export default withPageAuthRequired(Posts);
