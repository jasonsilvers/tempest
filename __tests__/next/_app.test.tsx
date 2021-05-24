import { unmountComponentAtNode, render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import App from '../../src/pages/_app';
import { waitForElementToBeRemoved } from '../utils/TempestTestUtils';

// simple component
const simpleComponent = () => <div id="hello">Hello World</div>;

let jssStyles: HTMLStyleElement;
let container: HTMLDivElement;
let sacrificialElement: HTMLDivElement;
beforeEach(() => {
  container = document.createElement('div');
  jssStyles = document.createElement('style');
  jssStyles.className = 'jss';
  sacrificialElement = document.createElement('div');
  container.appendChild(sacrificialElement);
});
afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('should render the _app for next js', async () => {
  // add the jssStyles to the document head
  document.head.appendChild(jssStyles);

  act(() => {
    render(<App Component={simpleComponent} pageProps={null} />, container);
  });

  // hack to supress the "wrap in act" warning
  waitForElementToBeRemoved(() => sacrificialElement);

  // expect our use effect in _app to not remove this style since the id is not jss-server-side
  // clean up document.head after expect
  expect(document.contains(jssStyles)).toBeTruthy();
  document.head.removeChild(jssStyles);
});

it('should render the _app for next js and remove the #jss-server-side element', async () => {
  // set id of styles to jss-server-side and append to document.head
  jssStyles.id = 'jss-server-side';
  document.head.appendChild(jssStyles);

  act(() => {
    render(<App Component={simpleComponent} pageProps={null} />, container);
  });

  // wait for jssStyles to be removed by the use effect in _app
  waitForElementToBeRemoved(() => jssStyles);
  expect(document.contains(jssStyles)).toBeFalsy();
});
