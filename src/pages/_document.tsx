import React from 'react';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { ServerStyleSheets } from '@material-ui/core/styles';
import crypto from 'crypto';

const cspHashOf = (text: string) => {
  const hash = crypto.createHash('sha512');
  hash.update(text);
  return `'sha512-${hash.digest('base64')}'`;
};

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const muiSheet = new ServerStyleSheets();

    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => muiSheet.collect(sheet.collectStyles(<App {...props} />)),
        });

      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
            {muiSheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    const csp = `style-src https://fonts.googleapis.com 'unsafe-inline'; img-src * data:; font-src https://fonts.gstatic.com data:; default-src 'self'; script-src 'unsafe-eval' 'self' ${cspHashOf(
      NextScript.getInlineScriptSource(this.props)
    )}`;

    return (
      <Html>
        <Head>
          <meta httpEquiv="Content-Security-Policy" content={csp} />
          <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=DM Sans&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
