import { User } from '@prisma/client';
import { IUserContext } from '@tron/nextjs-auth-p1/dist/client/UserContextProvider';
import * as router from 'next/router';
import { NextRouter } from 'next/router';

export const useTestRouter: jest.SpyInstance<Partial<NextRouter>> = jest.spyOn(
  router,
  'useRouter'
);

export const useTestUser: jest.SpyInstance<
  IUserContext<Partial<User>>
> = jest.spyOn(require('@tron/nextjs-auth-p1'), 'useUser');
