import React from 'react';
import { createGlobalStyle } from 'styled-components';
import tw, { theme, GlobalStyles as BaseStyles } from 'twin.macro';

const fontFamily = theme`fontFamily.default`;
const antialiased = tw`antialiased`;

const CustomStyles = createGlobalStyle`
  body {
    font-family: ${fontFamily};
    background-color: #E5E5E5;
    ${antialiased};
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
