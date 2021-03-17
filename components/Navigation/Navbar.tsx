import { useState } from "react";
import { useRouter } from "next/router"

interface INavbarComposition {
  Link: React.FC<ILinkProps>;
  Prev: React.FC
}

const Navbar: React.FC & INavbarComposition = ({ children }) => {
  return <div>{children}</div>;
};

interface ILinkProps {
  goToUrl: string;
}

const Link: React.FC<ILinkProps> = ({ children, goToUrl }) => {
  return <Link href={goToUrl}> {children} </Link>;
};

const Prev: React.FC = () => {
  const router = useRouter()
  // if(process.browser){

    return <Link href={router.back()}>Back</Link>
  // }else{
    // return <></>
  // }
}

Navbar.Link = Link;
Navbar.Prev = Prev;
export default Navbar;


