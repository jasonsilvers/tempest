import React from 'react';
import { render, waitFor, screen, fireEvent } from '../testutils/TempestTestUtils';
import AppProviders from '../../src/components/AppProviders';
import { useSnackbar } from 'notistack';
import { useLayoutEffect } from 'react';

const TestComponent: React.FC<{ enque?: boolean }> = ({ enque }) => {
  const { enqueueSnackbar } = useSnackbar();

  useLayoutEffect(() => {
    if (enque) {
      enqueueSnackbar('SNAKES', { variant: 'success' });
    }
  }, []);
  return <div>Test</div>;
};

describe('AppProviders', () => {
  it('should update the dom', () => {
    document.body.innerHTML = `
    <span data-testid="not-empty"><span data-testid="empty"></span></span>
    <div data-testid="visible">Visible Example</div>
  `;

    expect(screen.queryByTestId('not-empty')).not.toBeEmptyDOMElement();
    expect(screen.getByText('Visible Example')).toBeVisible();
  });
  it('should render children when wrapped in app provider', async () => {
    const { getByText } = render(
      <AppProviders pageProps={null}>
        <TestComponent />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText(/test/i)).toBeInTheDocument;
    });
  });

  it('Allow null pageprops in app providers ', async () => {
    const { getByText } = render(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText(/test/i)).toBeInTheDocument;
    });
  });

  it('create new queryClient if one is not already created ', async () => {
    const { getByText, rerender } = render(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    );

    rerender(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText(/test/i)).toBeInTheDocument;
    });
  });

  it('should dismiss the snackbar', async () => {
    const { getByText } = render(
      <AppProviders pageProps={null}>
        <TestComponent enque />
      </AppProviders>
    );

    await waitFor(() => {
      expect(getByText(/snakes/i)).toBeInTheDocument();
    });
    fireEvent.click(getByText(/dismiss/i));
  });
});
