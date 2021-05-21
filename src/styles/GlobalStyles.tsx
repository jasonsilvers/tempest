import React from 'react';
import { createGlobalStyle } from 'styled-components';
import tw, { theme, GlobalStyles as BaseStyles } from 'twin.macro';
const FontFaceObserver = require('fontfaceobserver')

const Fonts = () => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900'
  link.rel = 'stylesheet'

  document.head.appendChild(link)

  const roboto = new FontFaceObserver('Roboto')

  roboto.load().then(() => {
    document.documentElement.classList.add('roboto')
  })
}

const CustomStyles = createGlobalStyle`
  body {
    font-family: ${theme`fontFamily.default`};
    color: ${theme`colors.purple.500`};
    ${tw`antialiased`}
  }
`;

const GlobalStyles = () => {
  if(process.browser){
  Fonts()
  }
  return( <>
    <BaseStyles />
    <CustomStyles />
    </>
  );
}

export default GlobalStyles;
