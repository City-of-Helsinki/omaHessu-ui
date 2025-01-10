import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';

import './index.css';
import BrowserApp from './BrowserApp';
import * as serviceWorker from './serviceWorker';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _env_: any;
    _paq: [string, ...unknown[]][];
  }
}

if (window._env_.REACT_APP_SENTRY_DSN && window._env_.REACT_APP_ENVIRONMENT) {
  Sentry.init({
    dsn: window._env_.REACT_APP_SENTRY_DSN,
    environment: window._env_.REACT_APP_ENVIRONMENT,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(<BrowserApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
