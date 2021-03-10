import { User } from "@prisma/client";
import { GetServerSidePropsContext, NextApiResponse } from "next";
import { ComponentType } from "react";
import {
  NextAPIRequestWithAuthorization,
  WithPageAuthRequiredOptions,
} from "../server/types/types";
import {withPageAuth} from '../client/with-page-auth'
import { jwtParser } from "../server/utils/jwtUtils";

export const assertCtx = ({ req, res }) => {
  if (!req) {
    throw new Error("Request is not available");
  }
  if (!res) {
    throw new Error("Response is not available");
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

export function withPageAuthFactory(
  {P1_AUTH_JWT_KEY_DESCRIMINATOR}
) {
  return (optsOrComponent: WithPageAuthRequiredOptions | ComponentType): any => {
    // Check if param passed is function vs object
    // Since this will run Client Side we must make a call or rely on context for the user
    if (typeof optsOrComponent === "function") {
      return withPageAuth(optsOrComponent);
    }

    // param passed is an object of type WithPageAuthRequiredOptions
    // lets use destructuring to get the function the developer wants to inject for getServerSideProps
    const {
      getServerSideProps,
      returnTo,
      DBQueryFunctionToReturnUser,
    } = optsOrComponent;

    return async (ctx: GetServerSidePropsContext) => {
      assertCtx(ctx);

      // grab the jwt and parse
      const jwt = await jwtParser(
        ctx.req as NextAPIRequestWithAuthorization<User>,
        ctx.res as NextApiResponse
      );

      const query = jwt[P1_AUTH_JWT_KEY_DESCRIMINATOR];

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
  };
}