
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next";
import React, { ComponentType, useEffect } from "react";

export type GetServerSidePropsResultWithSession<T> = GetServerSidePropsResult<{
  user?: T;
  [key: string]: any;
}>;

export type GetStaticPropsResultWithSession<T> = GetStaticPropsResult<{
  user?: T;
  [key: string]: any;
}>;

export const assertCtx = ({
  req,
  res,
}) => {
  if (!req) {
    throw new Error("Request is not available");
  }
  if (!res) {
    throw new Error("Response is not available");
  }
};

// export type WithPageAuthRequiredOptions<T> = {
//   user: T,
//   getServerSideProps?: GetServerSideProps;
//   returnTo?: string;
// };

// export type WithPageAuthRequired = {
//   (opts?: WithPageAuthRequiredOptions): pageRoute
// }

export function withPageAuth<T>(getProps: () => any) {
  return async (
    ctx: any
  ): Promise<GetServerSidePropsResultWithSession<T> | GetStaticPropsResultWithSession<T>> => {
    // assertCtx(ctx);
    // const session = getSession(ctx.req, ctx.res); //JWT parser


    console.log("should print", ctx);
    
    const session = {
      user: {
        name: "hello",
      }
    };

    if (!session?.user) {
      // 10 - redirect
      // 9.5.4 - unstable_redirect
      // 9.4 - res.setHeaders
      
      return {
        redirect: {
          destination: "", //`${loginUrl}?returnTo=${returnTo || ctx.resolvedUrl}`,
          permanent: false,
        },
      };
    }
    let ret: any = { props: {} };
    if (getProps) {
      ret = await getProps();
    }
    return { ...ret, props: { ...ret.props, user: session.user } };
  };
}

export type WithPageAuthRequired = <P extends object>(
  Component: ComponentType<P>,
  options?: {}
) => React.FC<P>;



export const withPageAuthRequired = (Component) => {
  return function withPageAuthRequired(props) {

    const isFunction = typeof Component === 'function'

    console.log(isFunction)

    const user = {
        name: "hello"
    };

    // if (error) return onError(error);
    return <Component {...props} />;
  };
};

