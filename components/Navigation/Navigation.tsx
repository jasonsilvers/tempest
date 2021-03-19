import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled from 'styled-components';

interface ILinkProps {
  goToUrl?: string;
  activeLinkStyle?: React.CSSProperties;
  className?: string;
}

const StyledHeader = styled.a`
  font-size: 2rem;
  margin-right: 2rem;
`;

const Header: React.FC<ILinkProps> = ({
  children,
  goToUrl,
  className = '',
}) => {
  return (
    <NextLink href={goToUrl}>
      <StyledHeader className={className}>{children}</StyledHeader>
    </NextLink>
  );
};

const StyledLink = styled.a`
  margin-right: 1.5rem;
`;

const Link: React.FC<ILinkProps> = ({
  children,
  goToUrl,
  className,
  activeLinkStyle,
}) => {
  const router = useRouter();

  return (
    <NextLink href={goToUrl ?? '/'}>
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
