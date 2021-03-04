import { Post } from "@prisma/client";
import axios from "axios";
import {
  GetStaticProps,
  GetStaticPropsResult,
  InferGetStaticPropsType,
  InferGetServerSidePropsType,
} from "next";
import { useContext } from "react";
import { QueryClient, useQuery } from "react-query";
import { dehydrate } from "react-query/hydration";
import { UserContext } from "./_app";

async function fetchPosts() {
  return await axios.get("/api/posts").then((response) => response.data);
}

function Posts(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: posts } = useQuery<Post[]>("posts", fetchPosts);

  const userContext = useContext(UserContext);

  console.log(userContext)

  return (
    <div>
      <h1>Posts on another page with hydration</h1>
      {posts?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

//If you page depends on external data you can use:

//For Page generation at build
export async function getStaticProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["posts"], () => fetchPosts());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

//For page generation on every request

// export async function getServerSideProps() {}

export default Posts;
