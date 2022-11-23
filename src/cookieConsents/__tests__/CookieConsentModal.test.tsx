import React from 'react';
import { render } from '@testing-library/react';
import { ContentSource } from 'hds-react';

import CookieConsentModal from '../CookieConsentModal';
import MockCookieModal, {
  triggerOnConsentsParsed,
  triggeronAllConsentsGiven,
  setCookieConsents,
  verifyTrackingCookiesAreRemembered,
  verifyTrackingCookiesAreForgotten,
} from '../__mocks__/CookieModalAndPage';
import { trackingCookieId } from '../cookieContentSource';
import config from '../../config';

jest.mock('hds-react', () => ({
  ...jest.requireActual('hds-react'),
  CookieModal: (props: { contentSource: ContentSource }) => (
    <MockCookieModal contentSource={props.contentSource} />
  ),
}));

const mockUseLocationValue = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue),
}));

describe('CookieConsentModal', () => {
  const pushTracker = jest.fn();
  const initialEnv = window._env_.REACT_APP_ENVIRONMENT;
  const renderComponent = () => render(<CookieConsentModal />);
  beforeAll(() => {
    ((global.window as unknown) as { _paq: { push: jest.Mock } })._paq = {
      push: pushTracker,
    };
    window._env_.REACT_APP_ENVIRONMENT = 'production';
  });
  afterEach(() => {
    mockUseLocationValue.pathname = '/';
    pushTracker.mockReset();
  });
  afterAll(() => {
    window._env_.REACT_APP_ENVIRONMENT = initialEnv;
  });
  describe('renders HDS cookieModal and calls onConsentsParsed', () => {
    it('and tracking is disabled, if consent is not given.', async () => {
      const result = renderComponent();
      await triggerOnConsentsParsed(result);
      verifyTrackingCookiesAreForgotten(pushTracker);
      expect(() =>
        result.getByTestId('mock-cookie-modal-and-page')
      ).not.toThrow();
    });
    it('and tracking is enabled, if consent is given.', async () => {
      const result = renderComponent();
      await setCookieConsents(result, { [trackingCookieId]: true });
      await triggerOnConsentsParsed(result);
      verifyTrackingCookiesAreRemembered(pushTracker);
    });
  });

  describe('does not render HDS cookieModal', () => {
    it('if route is config.autoSSOLoginPath', async () => {
      mockUseLocationValue.pathname = config.autoSSOLoginPath;
      const result = renderComponent();
      expect(() => result.getByTestId('mock-cookie-modal-and-page')).toThrow();
      expect(pushTracker).toHaveBeenCalledTimes(0);
    });
  });

  describe('when modal is closed and onAllConsentsGiven is called', () => {
    it('tracking cookies are remembered, if consent is given', async () => {
      const result = renderComponent();
      await setCookieConsents(result, { [trackingCookieId]: true });
      await triggeronAllConsentsGiven(result);
      verifyTrackingCookiesAreRemembered(pushTracker);
    });
    it('tracking cookies are forgotten, if consent is not given', async () => {
      const result = renderComponent();
      await triggeronAllConsentsGiven(result);
      verifyTrackingCookiesAreForgotten(pushTracker);
    });
  });
});
