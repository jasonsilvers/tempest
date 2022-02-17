import Head from 'next/head';
import React from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';
import { LoggedInUser } from '../repositories/userRepo';
import { ERole } from '../const/enums';

import 'twin.macro';

const LoginLoader = () => {
  return (
    <div tw="text-primary flex flex-col space-y-10 items-center">
      <h3 tw="text-5xl">Welcome to Cascade!</h3>
      <svg width="120" height="30" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg" fill="#fff">
        <circle fill="currentColor" cx="15" cy="15" r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle fill="currentColor" cx="60" cy="15" r="9" fillOpacity="0.3">
          <animate
            attributeName="r"
            from="9"
            to="9"
            begin="0s"
            dur="0.8s"
            values="9;15;9"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            from="0.5"
            to="0.5"
            begin="0s"
            dur="0.8s"
            values=".5;1;.5"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle fill="currentColor" cx="105" cy="15" r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <p tw="text-base">Please give us a moment while we gather your things...</p>
    </div>
  );
};

function Home() {
  const { user, isLoading } = useUser<LoggedInUser>();
  const router = useRouter();

  if (!user && !isLoading) {
    router.push('/Unauthenticated');
  }

  if (user && !user.organizationId) {
    router.push('/Welcome');
  }

  if (user && user.role.name === ERole.MEMBER && user.organizationId) {
    router.push(`/Profile/${user.id}`);
  }

  if (user && user.role.name !== ERole.MEMBER && user.organizationId) {
    router.push('/Dashboard');
  }

  return (
    <div>
      <Head>
        <title>Cascade</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main tw="flex items-center justify-center">
        <LoginLoader />
      </main>
    </div>
  );
}

export default Home;
