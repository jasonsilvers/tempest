import { User } from '@prisma/client';
import { IUserContext } from '@tron/nextjs-auth-p1/dist/client/UserContextProvider';

export const useTestRouter = jest.spyOn(require('next/router'), 'useRouter');

export const useTestUser: jest.SpyInstance<
  IUserContext<Partial<User>>
> = jest.spyOn(require('@tron/nextjs-auth-p1'), 'useUser');
