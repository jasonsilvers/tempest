import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import DefaultIcon from "./Asset/UserIcon.svg"
import styled from 'styled-components'



/**
 * Navigation context
 *
 * This ensures dev error messages are sent when using
 * the sub components of Navigation incorrectly
 * */
const NavigationContext = React.createContext("");
const useNavigationContext = (comp?: string) => {
  const context = useContext(NavigationContext);

  if (context !== "nav") {
    throw Error(`You must use ${comp ?? "This Component"} inside <Navigation>`);
  }
};

interface INavbarComposition {
  Header: React.FC<ILinkProps>;
  Link: React.FC<ILinkProps>;
  Prev: React.FC;
  Profile: React.FC<ILinkProps>;
}

interface INavigationProps {
  className?: string;
}

const StyledDiv = styled.div`
display: flex;
align-items: center;
`

/*

const Component = styled.div`
  background: blue;
  color: red;
`

const ExtendedComponent = styled(Component)`
  color: green;
`*/

const Navigation: React.FC<INavigationProps> & INavbarComposition = ({ children, className = "" }) => {
  return (
    <NavigationContext.Provider value="nav">
      <StyledDiv>{children}</StyledDiv>
    </NavigationContext.Provider>
  );
};

const Header: React.FC<ILinkProps> = ({ children, goToUrl, className = "" }) => {
  useNavigationContext("<Navigation.Header>");
  return (
    <NextLink href={goToUrl}>
      <a className={"header" + " " + className }
      >
        {children}
      </a>
    </NextLink>
  );
};

interface ILinkProps extends INavigationProps {
  goToUrl: string;
}

const StyledLink = styled.a`margin-right: 1.5rem;`

const Link: React.FC<ILinkProps> = ({ children, goToUrl, className }) => {
  const router = useRouter();
  useNavigationContext("<Navigation.Link>");
  return (
    <NextLink href={goToUrl}>
      <StyledLink
        className={className}
        style={{ color: `${router.route === goToUrl ? "blue" : "black"}` }}
      >
        {children}
      </StyledLink>
    </NextLink>
  );
};

const Prev: React.FC = () => {
  const router = useRouter();
  useNavigationContext("<Navigation.Prev/>");
  return <a onClick={() => router.back()}>Go Back</a>;
};

interface IProfileProps {
 ProfileIcon?: JSX.Element
}

const Profile: React.FC<ILinkProps & IProfileProps> = ({ children, goToUrl, className, ProfileIcon=DefaultIcon }) => {
  useNavigationContext("<Navigation.Profile>");

  return (
    <NextLink href={goToUrl}>
      <a className={className + " " + "profile" }>
        {children}
      <ProfileIcon height="32px" width="32px"/>
      </a>
    </NextLink>
  );
};


Navigation.Link = Link;
Navigation.Prev = Prev;
Navigation.Header = Header;
Navigation.Profile = Profile;
export default Navigation;
