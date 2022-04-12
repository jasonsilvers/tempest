import { Typography } from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import tw from 'twin.macro';

interface ILinkProps {
  goToUrl?: string;
  className?: string;
  icon?: React.ReactNode;
}

const StyledHeader = tw.a` mr-8 mb-6 uppercase text-4xl`;

const Header: React.FC<ILinkProps> = ({ children, goToUrl = '/', className = '' }) => {
  return (
    <NextLink href={goToUrl}>
      <StyledHeader className={className}>{children}</StyledHeader>
    </NextLink>
  );
};

const Link: React.FC<ILinkProps> = ({ children, goToUrl, icon }) => {
  const router = useRouter();

  if (router.asPath === goToUrl) {
    return (
      <NextLink href={goToUrl}>
        <a>
          <div tw="flex space-x-8 h-12 px-4">
            <div>{icon}</div>
            <Typography variant="body1" tw="text-secondary">
              {children}
            </Typography>
          </div>
        </a>
      </NextLink>
    );
  }

  return (
    <NextLink href={goToUrl}>
      <a>
        <div tw="flex space-x-8 h-12 px-4">
          <div>{icon}</div>
          <Typography variant="body1" tw="text-black">
            {children}
          </Typography>
        </div>
      </a>
    </NextLink>
  );
};

export { Link, Header };
