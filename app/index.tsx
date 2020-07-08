import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Root from './containers/Root';
import { history, configuredStore } from './store';
import './client';
import './extend';
import './app.global.css';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#8bc34a',
    },
    secondary: {
      main: '#ff3d00',
    },
  },
  typography: {
    fontSize: 14,
  },
});

const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <ThemeProvider theme={darkTheme}>
        <Root store={store} history={history} />
      </ThemeProvider>
    </AppContainer>,
    document.getElementById('root')
  )
);
