import React from 'react';
import { UserContextProvider } from '@tron/nextjs-auth-p1'; // auth lib
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { Button } from '@mui/material';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDayjs';

import { QueryProvider } from './QueryProvider';
import { AppProps } from 'next/dist/shared/lib/router/router';

const notistackRef = React.createRef<SnackbarProvider>();
const onClickDismiss = (key: string) => () => {
  notistackRef?.current?.closeSnackbar(key);
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#5344AE',
    },
    secondary: {
      main: '#7B6CD3',
    },
  },
});

function AppProviders({ children, pageProps }: { children: React.ReactNode; pageProps: AppProps }) {
  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarProvider
            maxSnack={3}
            ref={notistackRef}
            action={(key: string) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            autoHideDuration={3000}
          >
            <QueryProvider
              pageProps={pageProps}
              queryClientOptions={{
                defaultOptions: {
                  queries: {
                    refetchOnWindowFocus: false,
                  },
                },
              }}
            >
              <UserContextProvider user={pageProps?.user}>{children}</UserContextProvider>
            </QueryProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </StyledEngineProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
