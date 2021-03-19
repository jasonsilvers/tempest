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

interface INavContext {
  activeLinkStyle:React.CSSProperties
}

const NavigationContext = React.createContext<React.CSSProperties>(null);
const useNavigationStyle = (comp: string, styleProp?: React.CSSProperties) => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw Error(`You must use ${comp ?? "This Component"} inside <Navigation>`);
  }

  return styleProp ? styleProp : context
};

interface INavbarComposition {
  Header: React.FC<ILinkProps>;
  Link: React.FC<ILinkProps>;
  Prev: React.FC;
  // Profile: React.FC<ILinkProps>;
}

interface INavigationProps {
  className?: string;
}

const StyledDiv = styled.div`
display: flex;
align-items: center;
`

const Navigation: React.FC<ILinkProps> & INavbarComposition = ({ children, className = "", activeLinkStyle={color:'blue'} }) => {
  return (
    <NavigationContext.Provider value={activeLinkStyle}>
      <StyledDiv className={className} >{children}</StyledDiv>
    </NavigationContext.Provider>
  );
};

const StyledHeader = styled.a`
font-size: 2rem;
margin-right: 2rem;`

const Header: React.FC<ILinkProps> = ({ children, goToUrl, className = "" }) => {
  useNavigationStyle("<Navigation.Header>");
  return (
    <NextLink href={goToUrl}>
      <StyledHeader className={className}>
        {children}
      </StyledHeader>
    </NextLink>
  );
};

interface ILinkProps extends INavigationProps {
  goToUrl: string;
  activeLinkStyle?: React.CSSProperties;
}

const StyledLink = styled.a`margin-right: 1.5rem;`

const Link: React.FC<ILinkProps> = ({ children, goToUrl, className, activeLinkStyle }) => {
  const router = useRouter();
  const styleToUse = useNavigationStyle("<Navigation.Link>", activeLinkStyle);

  return (
    <NextLink href={goToUrl}>
      <StyledLink
        className={className}
        style={router.route === goToUrl ? styleToUse : {}}
      >
        {children}
      </StyledLink>
    </NextLink>
  );
};

const Prev: React.FC = () => {
  const router = useRouter();
  useNavigationStyle("<Navigation.Prev/>");
  return <StyledLink onClick={() => router.back()}>Go Back</StyledLink>;
};

/*                   -----------------    Profile Commented Out -----------------                       */

// interface IProfileProps {
//  ProfileIcon?: JSX.Element
// }

// const Profile: React.FC<ILinkProps & IProfileProps> = ({ children, goToUrl, className, ProfileIcon=DefaultIcon }) => {
//   useNavigationContext("<Navigation.Profile>");

//   return (
//     <NextLink href={goToUrl}>
//       <a className={className + " " + "profile" }>
//         {children}
//       <ProfileIcon height="32px" width="32px"/>
//       </a>
//     </NextLink>
//   );
// };

// Navigation.Profile = Profile;
Navigation.Link = Link;
Navigation.Prev = Prev;
Navigation.Header = Header;
export default Navigation;
