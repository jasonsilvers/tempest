import React from 'react';
import { UserContextProvider } from '@tron/nextjs-auth-p1'; // auth lib
import { StylesProvider, ThemeProvider } from '@material-ui/styles';
import { SnackbarProvider } from 'notistack';
import { Button } from '../lib/ui';
import { createTheme } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayJsUtils from '@date-io/dayjs';

import { QueryProvider } from './QueryProvider';

const notistackRef = React.createRef<SnackbarProvider>();
const onClickDismiss = (key: string) => () => {
  notistackRef.current.closeSnackbar(key);
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D2270',
    },
    secondary: {
      main: '#6A5CBE',
    },
  },
});

function AppProviders({ children, pageProps = null }) {
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst>
        <MuiPickersUtilsProvider utils={DayJsUtils}>
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
            <QueryProvider>
              <UserContextProvider user={pageProps?.user}>{children}</UserContextProvider>
            </QueryProvider>
          </SnackbarProvider>
        </MuiPickersUtilsProvider>
      </StylesProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
