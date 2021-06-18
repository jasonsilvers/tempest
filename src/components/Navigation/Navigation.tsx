import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import tw from 'twin.macro';

interface ILinkProps {
  goToUrl?: string;
  activeLinkStyle?: React.CSSProperties;
  className?: string;
}

const StyledHeader = tw.a` mr-8 mb-6 uppercase text-4xl`;

const Header: React.FC<ILinkProps> = ({ children, goToUrl = '/', className = '' }) => {
  return (
    <NextLink href={goToUrl}>
      <StyledHeader className={className}>{children}</StyledHeader>
    </NextLink>
  );
};

const StyledLink = tw.a`mr-6 mb-5 text-lg uppercase text-gray-500 flex flex-row items-center space-x-4 cursor-pointer`;

const Link: React.FC<ILinkProps> = ({ children, goToUrl, className, activeLinkStyle }) => {
  const router = useRouter();
  return (
    <NextLink href={goToUrl}>
      <StyledLink
        className={className}
        style={router.asPath === goToUrl ? activeLinkStyle ?? { color: 'white', fontWeight: 'bolder' } : {}}
      >
        {children}
      </StyledLink>
    </NextLink>
  );
};

export { Link, Header };
