import { User } from '@prisma/client';
import prisma from '../prisma';

// required to infer the return type from the Prisma Client
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

// type === User & { role?: Role };
export type UserWithRole = ThenArg<ReturnType<typeof findUserByDodId>>;

/**
 * Get user method to query the PSQL db though the prisma client
 * for use with the @tron-p1-auth library
 *
 * @param queryString dodid
 * @returns UserWithRole
 */
export const findUserByDodId = async (queryString: string) => {
  console.log(queryString)
  return await prisma.user.findUnique({
    where: {
      dodId: queryString,
    },
    include: { role: true },
  });
};

/**
 * Get user method to query the PSQL db though the prisma client
 *
 * @param query unique db id
 * @returns UserWithRole
 */
export const findUserById = async (query: string) => {
  return await prisma.user.findUnique({
    where: {
      id: query,
    },
    include: { role: true },
  });
};


export const getUsers = async () => {
  return await prisma.user.findMany()
  }

/**
 * Post user method to create the PSQL db though the prisma client
 *
 * @param user
 * @returns User
 */
export const createUser = async (user: User) => {
  return await prisma.user.create({
    data: user,
  });
};

/**
 * Put User method to update the PSQL db though the prisma client
 *
 * @param user
 * @returns User
 */
export const updateUser = async (user: User) => {
  return prisma.user.update({
    where: { id: user.id },
    data: user,
  });
};
