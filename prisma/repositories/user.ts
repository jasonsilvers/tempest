import { User } from "@prisma/client";
import prisma from "../prisma";

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export const getUser = (queryString: string) => {
  return prisma.user.findUnique({
    where: {
      dodId: queryString,
    },
    include: { role: true },
  });
};

export type UserWithRole = ThenArg<ReturnType<typeof getUser>>;
