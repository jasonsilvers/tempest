import { AccessControl } from 'accesscontrol';
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  GetStaticPropsResult,
  NextApiRequest,
} from 'next';
import { ComponentType } from 'react';
import { UserDTO } from '../../../../../middleware/types';
import { P1JWT } from '../utils/jwtUtils';

export type NextAPIRequestWithAuthorization<T> = NextApiRequest & {
  user: T;
};

export type NextApiResponseWithAuthorization<T> = NextApiRequest & {
  user: T;
};

export type P1Token = {
  usercertificate: string;
};

export type GetServerSidePropsResultWithSession<T> = GetServerSidePropsResult<{
  user?: T;
  [key: string]: any;
}>;

export type GetStaticPropsResultWithSession<T> = GetStaticPropsResult<{
  user?: T;
  [key: string]: any;
}>;

type JWTTokens = keyof P1JWT;

export type WithPageAuthRequiredOptions<T> = {
  DBQueryFunctionToReturnUser: (query: string) => Promise<T>;
  getServerSideProps?: GetServerSideProps;
  returnTo?: string;
  discriminatorJWTToken: JWTTokens | string; // i'm torn here.  remove the string you get intellisense
};

export type WithComponentAuthRequired = <P extends object>(
  Component: ComponentType<P>,
  options?: {}
) => React.FC<P>;
