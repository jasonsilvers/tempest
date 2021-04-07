import { User } from '@prisma/client';
import prisma from '../prisma';

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

// === User & { role?: Role };
export type UserWithRole = ThenArg<ReturnType<typeof getUserByDodId>>;

export const getUserByDodId = async (queryString: string) => {
  return await prisma.user.findUnique({
    where: {
      dodId: queryString,
    },
    include: { role: true },
  });
};

export const getUserById = async (query: number) => {
  return await prisma.user.findUnique({
    where: {
      id: query,
    },
    include: { role: true },
  });
};

export const postUser = async (user: User) => {
  return await prisma.user.create({
    data: user,
  });
};

export const putUser = async (user: User) => {
  return prisma.user.create({
    data: user,
  });
};
