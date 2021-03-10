import React from "react";
import { Post, User } from "@prisma/client";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useMutationCacheStatus } from "../hooks/useMutationCacheStatus";

export function UsersList() {
  const query = useQuery<User[]>("users", () =>
    axios
      .get("http://localhost:3000/api/users")
      .then((response) => response.data)
  );

  return (
    <div>
      <h2>Users</h2>
      {query.data?.map((user) => {
        return <p key={user.id}>{user.name}</p>;
      })}
    </div>
  );
}

export function PostsList() {
  const query = useQuery<Post[]>("posts", () =>
    axios.get("/api/posts").then((response) => response.data)
  );

  return (
    <div>
      <h2>Posts</h2>
      {query.data?.map((post) => {
        return <div key={post.id}>{post.title}</div>;
      })}
    </div>
  );
}

export function CreatePost() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    "post",
    (newPost: Post) => axios.put("/api/post/23232", newPost),
    {
      onSuccess: () => queryClient.refetchQueries("posts"),
    }
  );

  const postNew = {
    title: "this is a new post",
    content: "content",
    authorId: 1,
  } as Post;

  return (
    <div>
      <PostStatusComponent />
      <button
        onClick={() => {
          mutate(postNew);
        }}
      >
        Create Post
      </button>
    </div>
  );
}

export function CreateUser() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    "user",
    (newUser: User) => axios.put("/api/user/22323", newUser),
    {
      onSuccess: () => queryClient.refetchQueries("users"),
    }
  );

  const userNew = {
    name: "your mom",
    email: `bob${Math.random()}@gmail.com`,
  } as User;

  return (
    <div>
      <UserStatusComponent />
      <button
        onClick={() => {
          mutate(userNew);
        }}
      >
        Create User
      </button>
    </div>
  );
}

export function UserStatusComponent() {
  const mutationStatus = useMutationCacheStatus("user");

  console.log("in User Status", mutationStatus);
  return (
    <div>
      {mutationStatus === "loading" ? <p>is adding new User</p> : null}
      <p>User Mutation Status - {mutationStatus}</p>
    </div>
  );
}

export function PostStatusComponent() {
  const mutationStatus = useMutationCacheStatus("post");

  console.log("in post status", mutationStatus);
  return (
    <div>
      {mutationStatus === "loading" ? <p>is adding new Post</p> : null}
      <p>Post Mutation Status - {mutationStatus}</p>
    </div>
  );
}
