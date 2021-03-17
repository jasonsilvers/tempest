
const NavItem:React.FC<{goToUrl: string}> = ({children, goToUrl}) => {
  return <a href={goToUrl}>{children}</a>;
};

export default NavItem;