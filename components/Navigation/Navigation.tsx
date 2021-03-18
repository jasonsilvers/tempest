import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';

/** 
 * Navigation context
 * 
 * This ensures dev error messages are sent when using 
 * the sub components of Navigation incorrectly
 * */ 
const NavigationContext = React.createContext('');
const useNavigationContext = (comp?: string) => {
  const context = useContext(NavigationContext);

  if (context !== 'nav') {
    throw Error(`You must use ${comp ?? 'This Component'} inside <Navigation>`);
  }
};


interface INavbarComposition {
  Link: React.FC<ILinkProps>;
  Prev: React.FC;
}

const Navigation: React.FC & INavbarComposition = ({ children }) => {
  return (
    <NavigationContext.Provider value="nav">
      <div>{children}</div>
    </NavigationContext.Provider>
  );
};



interface ILinkProps {
  goToUrl: string;
  className?: string;
}

const Link: React.FC<ILinkProps> = ({ children, goToUrl, className }) => {
  const router = useRouter();
  useNavigationContext('<Navigation.Link/>');

  return (
    <NextLink href={goToUrl}>
      <a
        className={className}
        style={{ color: `${router.route === goToUrl ? 'blue' : 'black'}` }}
      >
        {children}
      </a>
    </NextLink>
  );
};

const Prev: React.FC = () => {
  const router = useRouter();
  useNavigationContext('<Navigation.Prev/>');
  return <a onClick={() => router.back()}>Go Back</a>;
};

Navigation.Link = Link;
Navigation.Prev = Prev;
export default Navigation;
