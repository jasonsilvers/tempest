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

const StyledLink = tw.a`text-lg text-secondary flex flex-row items-center space-x-6 cursor-pointer h-14 w-52`;
const StyledActiveLInk = tw(StyledLink)`bg-secondary text-white rounded-lg`;
const StyledIcon = tw.div`bg-accent rounded-l-lg h-full flex items-center w-14 justify-center`;
const StyledChildren = tw.div`w-32`;
const StyledNonActiveIcon = tw(StyledIcon)`bg-white`;

const Link: React.FC<ILinkProps> = ({ children, goToUrl, icon }) => {
  const router = useRouter();

  if (router.asPath === goToUrl) {
    return (
      <NextLink href={goToUrl}>
        <StyledActiveLInk>
          <StyledIcon>{icon}</StyledIcon>
          <StyledChildren>{children}</StyledChildren>
        </StyledActiveLInk>
      </NextLink>
    );
  }

  return (
    <NextLink href={goToUrl}>
      <StyledLink>
        <StyledNonActiveIcon>{icon}</StyledNonActiveIcon>
        <StyledChildren>{children}</StyledChildren>
      </StyledLink>
    </NextLink>
  );
};

export { Link, Header };
