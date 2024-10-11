import React, { lazy, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';
import { useTranslation } from 'react-i18next';
import {
  LoginProvider,
  LoginProviderProps,
  WithAuthentication,
} from 'hds-react';
import { ApolloProvider } from '@apollo/client';
import { UserManagerSettings } from 'oidc-client-ts';

import graphqlClient from './graphql/client';
import { Provider as ProfileProvider } from './profile/context/ProfileContext';
import GdprAuthorizationCodeManagerCallback from './gdprApi/GdprAuthorizationCodeManagerCallback';
import ToastProvider from './toast/ToastProvider';
import config from './config';
import { useHistoryListener } from './profile/hooks/useHistoryListener';
import MatomoTracker from './common/matomo/MatomoTracker';
import { MatomoProvider } from './common/matomo/matomo-context';
import Loading from './common/loading/Loading';

const OidcCallback = lazy(() =>
  import('./auth/components/oidcCallback/OidcCallback')
);
const PasswordChangeCallback = lazy(() =>
  import('./passwordChange/PasswordChangeCallback')
);
const Login = lazy(() => import('./auth/components/login/Login'));
const Profile = lazy(() => import('./profile/components/profile/Profile'));
const AboutPage = lazy(() => import('./aboutPage/AboutPage'));
const UserGuide = lazy(() => import('./userGuide/UserGuide'));
const AccessibilityStatement = lazy(() =>
  import('./accessibilityStatement/AccessibilityStatement')
);
const ProfileDeleted = lazy(() =>
  import('./profile/components/profileDeleted/ProfileDeleted')
);
const ErrorPage = lazy(() =>
  import('./profile/components/errorPage/ErrorPage')
);
const LoginSSO = lazy(() => import('./auth/components/loginsso/LoginSSO'));
const CookieConsentPage = lazy(() =>
  import('./cookieConsents/CookieConsentPage')
);
const PageNotFound = lazy(() => import('./common/pageNotFound/PageNotFound'));

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

function App(): React.ReactElement {
  useHistoryListener();

  const matomoTracker = new MatomoTracker({
    urlBase: window._env_.REACT_APP_MATOMO_URL_BASE,
    siteId: window._env_.REACT_APP_MATOMO_SITE_ID,
    srcUrl: window._env_.REACT_APP_MATOMO_SRC_URL,
    enabled: window._env_.REACT_APP_MATOMO_ENABLED === 'true',
    configurations: {
      setDoNotTrack: true,
    },
  });

  const origin = window.location.origin;

  const settings: Partial<UserManagerSettings> = {
    automaticSilentRenew: true,
    validateSubOnSilentRenew: false,
    includeIdTokenInSilentRenew: false,
    monitorSession: true,
    filterProtocolClaims: false,
    authority: window._env_.REACT_APP_OIDC_AUTHORITY,
    client_id: window._env_.REACT_APP_OIDC_CLIENT_ID,
    redirect_uri: `${origin}/callback`,
    silent_redirect_uri: `${origin}/silent_renew.html`,
    response_type: window._env_.REACT_APP_OIDC_RESPONSE_TYPE,
    scope: window._env_.REACT_APP_OIDC_SCOPE,
    post_logout_redirect_uri: `${origin}/`,
    // This calculates to 1 minute, good for debugging:
    // eslint-disable-next-line max-len
    // https://github.com/City-of-Helsinki/kukkuu-ui/blob/8029ed64c3d0496fa87fa57837c73520e8cbe37f/src/domain/auth/userManager.ts#L18
    // accessTokenExpiringNotificationTimeInSeconds: 3600 - 60,
  };

  const providerProperties: LoginProviderProps = {
    userManagerSettings: settings,
    apiTokensClientSettings: {
      url: `${window._env_.REACT_APP_OIDC_AUTHORITY}api-tokens/`,
    },
    debug: true,
    sessionPollerSettings: { pollIntervalInMs: 300000 },
  };

  const { t } = useTranslation();

  return (
    <LoginProvider {...providerProperties}>
      <ApolloProvider client={graphqlClient}>
        <ToastProvider>
          <MatomoProvider value={matomoTracker}>
            <ProfileProvider>
              <Suspense
                fallback={
                  <Loading isLoading loadingText={t('profile.loading')} />
                }
              >
                <Switch>
                  <Route path="/callback" component={OidcCallback} />
                  <Route path="/gdpr-callback">
                    <GdprAuthorizationCodeManagerCallback />
                  </Route>
                  <Route
                    path="/password-change-callback"
                    component={PasswordChangeCallback}
                  ></Route>
                  <Route path="/login">
                    <Login />
                  </Route>
                  <Route path={['/', '/connected-services']} exact>
                    <WithAuthentication
                      AuthorisedComponent={Profile}
                      UnauthorisedComponent={Login}
                    />
                  </Route>
                  <Route path="/about" exact>
                    <AboutPage />
                  </Route>
                  <Route path="/guide" exact>
                    <UserGuide />
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
                  <Route path={config.autoSSOLoginPath} exact>
                    <LoginSSO />
                  </Route>
                  <Route path={config.cookiePagePath} exact>
                    <CookieConsentPage />
                  </Route>
                  <Route path="*">
                    <PageNotFound />
                  </Route>
                </Switch>
              </Suspense>
            </ProfileProvider>
          </MatomoProvider>
        </ToastProvider>
      </ApolloProvider>
    </LoginProvider>
  );
}

export default App;
