import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface INavbarComposition {
  Link: React.FC<ILinkProps>;
  Prev: React.FC;
}

const Navigation: React.FC & INavbarComposition = ({ children }) => {
  return <div>{children}</div>;
};

interface ILinkProps {
  goToUrl: string;
  className?: string
}

const Link: React.FC<ILinkProps> = ({ children, goToUrl, className }) => {
  const router = useRouter();
  return (
      <NextLink href={goToUrl}>
        <a className={className} style={{ color: `${router.route === goToUrl ? 'blue' : 'black'}` }}>
          {children}
        </a>
      </NextLink>
  );
};

const Prev: React.FC = () => {
  const router = useRouter();
  return <a onClick={() => router.back()}>Go Back</a>;
};

Navigation.Link = Link;
Navigation.Prev = Prev;
export default Navigation;
