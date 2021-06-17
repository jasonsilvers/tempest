import React from 'react';
import { createGlobalStyle } from 'styled-components';
import tw, { theme, GlobalStyles as BaseStyles } from 'twin.macro';

const color = theme`colors.purple.500`;
const fontFamily = theme`fontFamily.default`;
const antialiased = tw`antialiased`;

const CustomStyles = createGlobalStyle`
  body {
    font-family: ${fontFamily};
    color: ${color}
    ${antialiased}
  }
`;

const GlobalStyles = () => {
  return (
    <>
      <BaseStyles />
      <CustomStyles />
    </>
  );
};

export default GlobalStyles;
