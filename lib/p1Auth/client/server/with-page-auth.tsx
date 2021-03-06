import { GetServerSidePropsContext, NextApiResponse } from 'next';
import React, { ComponentType } from 'react';
import {
  NextAPIRequestWithAuthorization,
  WithComponentAuthRequired,
  WithPageAuthRequiredOptions,
} from './types/types';
import { jwtParser } from './utils/jwtUtils';

export const assertCtx = ({ req, res }) => {
  if (!req) {
    throw new Error('Request is not available');
  }
  if (!res) {
    throw new Error('Response is not available');
  }
};

/**
 * Wrap your `getServerSideProps` with this method to make sure the user is authenticated before visiting the page.
 *
 *
 * If the user visits `/protected-page` without a valid session, it will redirect the user to the login page.
 * Then they will be returned to `/protected-page` after login.
 *
 * @category Server and Client
 */

export function withPageAuthFor<T>(
  optsOrComponent: WithPageAuthRequiredOptions<T> | ComponentType
) {
  // Check if param passed is function vs object
  // Since this will run Client Side we must make a call or rely on context for the user
  if (typeof optsOrComponent === 'function') {
    return withComponentAuthRequired(optsOrComponent);
  }

  // param passed is an object of type WithPageAuthRequiredOptions
  // lets use destructuring to get the function the developer wants to inject for getServerSideProps
  const {
    getServerSideProps,
    returnTo,
    discriminatorJWTToken,
    DBQueryFunctionToReturnUser,
  } = optsOrComponent;

  return async (ctx: GetServerSidePropsContext) => {
    assertCtx(ctx);

    // grab the jwt and parse
    const jwt = await jwtParser(
      ctx.req as NextAPIRequestWithAuthorization<T>,
      ctx.res as NextApiResponse
    );
    const query = jwt[discriminatorJWTToken];

    // return user based on function for query
    const user = await DBQueryFunctionToReturnUser(query);

    if (!user) {
      return {
        redirect: {
          destination: `${returnTo}`, //`${loginUrl}?returnTo=${returnTo || ctx.resolvedUrl}`,
          permanent: false,
        },
      };
    }
    let ret: any = { props: {} };
    ret = await getServerSideProps(ctx);

    // JSON Serializer can not handle dates here for user need to use:
    /// https://github.com/blitz-js/babel-plugin-superjson-next

    return { ...ret, props: { ...ret.props, user: { ...user } } };
  };
}

/**
 *
 * Function to wrap CRS Components that require Authentication
 *
 * @category Client
 */

export const withComponentAuthRequired: WithComponentAuthRequired = (
  Component
) => {
  return function withPageAuthRequired(props): JSX.Element {
    // this code will be ran server side
    // get user from context???
    // pros no api call
    // con could be circumvented on client side
    // make api call???
    // pros would require a jwt to be parsed
    // con api call to get user each time

    // Auth 0 uses context and an use user hook in their repo

    const user = {
      name: 'hello',
    };

    // if (error) return onError(error);
    return <Component {...props} />;
  };
};
