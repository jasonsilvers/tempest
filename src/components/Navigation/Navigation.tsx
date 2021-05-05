import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import tw from 'twin.macro';

interface ILinkProps {
  goToUrl?: string;
  activeLinkStyle?: React.CSSProperties;
  className?: string;
}

const StyledHeader = tw.a` mr-8 mb-12 uppercase text-4xl`;

const Header: React.FC<ILinkProps> = ({
  children,
  goToUrl = '/',
  className = '',
}) => {
  return (
    <NextLink href={goToUrl}>
      <StyledHeader className={className}>{children}</StyledHeader>
    </NextLink>
  );
};


const StyledLink = tw.a`mr-6 text-lg flex flex-col`;

const Link: React.FC<ILinkProps> = ({
  children,
  goToUrl,
  className,
  activeLinkStyle,
}) => {
  const router = useRouter();

  return (
    <NextLink href={goToUrl}>
      <StyledLink
        className={className}
        style={
          router.route === goToUrl ? activeLinkStyle ?? { color: 'blue' } : {}
        }
      >
        {children}
      </StyledLink>
    </NextLink>
  );
};

// const Prev: React.FC = () => {
//   const router = useRouter();
//   return <StyledLink onClick={() => router.back()}>Go Back</StyledLink>;
// };

export { Link, Header };