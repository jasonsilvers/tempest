import React from 'react';
import { render, waitFor } from '@testing-library/react';
import AppProviders from '../../src/components/AppProviders';

const TestComponent = () => {
  return <div>Test</div>;
};

describe('AppProviders', () => {
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
});
