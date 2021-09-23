import { DocumentContext } from 'next/document';
import React from 'react';
import MyDocument from '../../src/pages/_document';
import { getPage } from 'next-page-tester';

const ctx = {
  asPath: '/',
  res: {
    writeHead: jest.fn(),
    end: jest.fn(),
  }, // not necessary but useful for testing other files
  /*eslint-disable */
  renderPage: (options: any = {}) => {
    /*eslint-disable */
    // for coverage, call enhanceApp and App
    if (typeof options.enhanceApp === 'function') {
      const app = options.enhanceApp(() => <div>App Rendered</div>);
      app();
    }
    return {
      html: <div>App Rendered</div>,
      head: (
        <head>
          <title>App Title</title>
        </head>
      ),
    };
  },
} as unknown as DocumentContext;

export function getMetaTagsContentByName(element: Element, name: string) {
  const head = element.querySelector('head') as HTMLHeadElement;
  const metaTags = head.querySelectorAll(`meta[http-equiv="${name}"]`) as NodeListOf<HTMLMetaElement>;
  const content: string[] = [];
  metaTags.forEach((tag) => content.push(tag.content));
  return content;
}

test('should return html, head and styles in getInitialProps', async () => {
  const result = await MyDocument.getInitialProps(ctx);

  expect(result.html.props.children).toBe('App Rendered');
  expect(result.head.props.children.props.children).toBe('App Title');
  expect(result.styles.props.children[2].props.id).toBe('jss-server-side');
});

test('should add CSP policy to head', async () => {
  const { render } = await getPage({ route: '/Unauthenticated', useDocument: true });
  render();

  const metaCSP = getMetaTagsContentByName(document.documentElement, 'Content-Security-Policy');
  expect(metaCSP.length).toBe(1);
});
