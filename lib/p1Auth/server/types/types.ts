import {
  GetServerSideProps,
  GetServerSidePropsResult,
  GetStaticPropsResult,
  NextApiRequest,
} from 'next';
import { ComponentType } from 'react';

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

export type DBQueryFunctionToReturnUser = (query: string) => Promise<any>

export type WithPageAuthRequiredOptions = {
  DBQueryFunctionToReturnUser: DBQueryFunctionToReturnUser
  getServerSideProps?: GetServerSideProps;
  returnTo?: string;
};

export type WithComponentAuth = <P extends object>(
  Component: ComponentType<P>,
  options?: {}
) => React.FC<P>;