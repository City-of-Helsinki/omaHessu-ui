import React from 'react';
import { useLocation } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';

import graphqlClient from './graphql/client';
import Login from './auth/components/login/Login';
import OidcCallback from './auth/components/oidcCallback/OidcCallback';
import Profile from './profile/components/profile/Profile';
import { Provider as ProfileProvider } from './profile/context/ProfileContext';
import ProfileDeleted from './profile/components/profileDeleted/ProfileDeleted';
import ErrorPage from './profile/components/errorPage/ErrorPage';
import AccessibilityStatement from './accessibilityStatement/AccessibilityStatement';
import GdprAuthorizationCodeManagerCallback from './gdprApi/GdprAuthorizationCodeManagerCallback';
import ToastProvider from './toast/ToastProvider';
import authService from './auth/authService';
import config from './config';
import PageNotFound from './common/pageNotFound/PageNotFound';
import CookieConsent from './cookieConsent/components/CookieConsent';
import { Provider as CookieContextProvider } from './cookieConsent/components/CookieConsentContext';
import {
  getRequiredAndOptionalConsentKeys,
  hasConsentForMatomo,
} from './cookieConsent/consents';
import CookieConsentPage from './cookieConsent/components/CookieConsentPage';

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

const instance = createInstance({
  urlBase: 'https://analytics.hel.ninja/',
  siteId: 60,
});

const isTrackingDisabled = window._env_.REACT_APP_ENVIRONMENT !== 'production';
// Prevent non-production data from being submitted to Matomo
// by pretending to require consent to process analytics data and never ask for it.
// https://developer.matomo.org/guides/tracking-javascript-guide#step-1-require-consent
if (isTrackingDisabled) {
  window._paq.push(['requireConsent']);
}

function App(): React.ReactElement {
  const location = useLocation();

  if (location.pathname === '/loginsso') {
    authService.login();
  }

  const redirectPaths = ['/loginsso', '/gdpr-callback', '/callback'];
  const doNotRenderCookieConsent = redirectPaths.includes(location.pathname);

  return (
    <ApolloProvider client={graphqlClient}>
      <ToastProvider>
        <MatomoProvider value={instance}>
          <CookieContextProvider
            {...getRequiredAndOptionalConsentKeys()}
            onAllConsentsGiven={consents => {
              if (isTrackingDisabled) {
                return;
              }
              if (hasConsentForMatomo(consents)) {
                window._paq.push(['setConsentGiven']);
                window._paq.push(['setCookieConsentGiven']);
              }
            }}
            onConsentsParsed={consents => {
              if (isTrackingDisabled) {
                return;
              }
              if (!hasConsentForMatomo(consents)) {
                window._paq.push(['requireConsent']);
                window._paq.push(['requireCookieConsent']);
              } else {
                window._paq.push(['trackPageView']);
              }
            }}
          >
            <ProfileProvider>
              {!doNotRenderCookieConsent && <CookieConsent />}
              <Switch>
                <Route path="/callback" component={OidcCallback} />
                <Route path="/gdpr-callback">
                  <GdprAuthorizationCodeManagerCallback />
                </Route>
                <Route path="/login">
                  <Login />
                </Route>
                <Route path={['/', '/connected-services']} exact>
                  <Profile />
                </Route>
                <Route path="/accessibility" exact>
                  <AccessibilityStatement />
                </Route>
                <Route path="/profile-deleted" exact>
                  <ProfileDeleted />
                </Route>
                <Route path={config.errorPagePath} exact>
                  <ErrorPage />
                </Route>
                <Route path="/loginsso" exact />
                <Route path="/cookie-consents" exact>
                  <CookieConsentPage />
                </Route>
                <Route path="*">
                  <PageNotFound />
                </Route>
              </Switch>
            </ProfileProvider>
          </CookieContextProvider>
        </MatomoProvider>
      </ToastProvider>
    </ApolloProvider>
  );
}

export default App;
