import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface INavbarComposition {
  Link: React.FC<ILinkProps>;
  Prev: React.FC;
}

const Navbar: React.FC & INavbarComposition = ({ children }) => {
  return <div>{children}</div>;
};


interface ILinkProps {
  goToUrl: string;
}

const Link: React.FC<ILinkProps> = ({ children, goToUrl }) => {
  return (
    <NextLink href={goToUrl}>
      <a>{children}</a>
    </NextLink>
  );
};

const Prev: React.FC = () => {
  if (process.browser) {
    const router = useRouter();
    return <a onClick={() => router.back()}>Go Back</a>;
  } else {
    return <></>;
  }
};

Navbar.Link = Link;
Navbar.Prev = Prev;
export default Navbar;
