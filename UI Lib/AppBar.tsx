import styled, { CSSProp } from 'styled-components';

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  background-color: darkolivegreen;
  height: 3rem;
`;

interface IStyleObjects {
  default: CSSProp;
  static: CSSProp;
}

interface IAppBarProps {
  type?: keyof IStyleObjects;
}

const AppBarStyle: IStyleObjects = {
  default: {},
  static: {},
};

const AppBar: React.FC<IAppBarProps> = ({ children, type = 'default' }) => {
  return <StyledDiv css={AppBarStyle[type]}>{children}</StyledDiv>;
};

export default AppBar;
