import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import * as Sentry from '@sentry/browser';

import './index.css';
import BrowserApp from './BrowserApp';
import * as serviceWorker from './serviceWorker';

Modal.setAppElement('#root');

const ENVS_WITH_SENTRY = ['staging', 'production'];

if (
  ENVS_WITH_SENTRY.includes(process.env.REACT_APP_ENVIRONMENT || 'development')
) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENVIRONMENT,
  });
}

ReactDOM.render(<BrowserApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
