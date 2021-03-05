import { Post, User } from "@prisma/client";
import axios from "axios";
import {
  GetStaticProps,
  GetStaticPropsResult,
  InferGetStaticPropsType,
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
} from "next";
import { useContext } from "react";
import {
  withPageAuthRequired,
  withPageAuth,
} from "../lib/p1Auth/client/server/with-page-auth";
import prisma from "../lib/prisma";
import { UserContext } from "./_app";

async function fetchPosts() {
  console.log("Calls end point");

  return axios.get("/api/posts");
}

function Posts(props: any) {
  // const { data: posts } = useQuery<Post[]>("posts", fetchPosts);

  const userContext = useContext(UserContext);

  console.log(props);

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
