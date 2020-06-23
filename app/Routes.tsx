/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import LeaderPage from './containers/LeaderPage';
import config from './config';

export default function Routes() {
  if (config.target === 'secretary') {
    return (
      <App>
        <Switch>
          <Route path={routes.HOME} component={HomePage} />
        </Switch>
      </App>
    );
  }

  return (
    <App>
      <Switch>
        <Route path={routes.LEADER} component={LeaderPage} />
      </Switch>
    </App>
  );
}
