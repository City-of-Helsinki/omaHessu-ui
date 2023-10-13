import {
  tunnistamoAuthCodeCallbackUrlAction,
  keycloakAuthCodeCallbackUrlAction,
} from './authCodeCallbackUrlDetector';
import {
  tunnistamoAuthCodeParserAction,
  keycloakAuthCodeParserAction,
} from './authCodeParser';
import {
  tunnistamoAuthCodeRedirectionAction,
  keycloakAuthCodeRedirectionAction,
} from './authCodeRedirectionHandler';
import {
  tunnistamoRedirectionInitializationAction,
  keycloakRedirectionInitializationAction,
} from './authCodeRedirectionInitialization';
import { downloadAsFileAction } from './downloadAsFile';
import { getDownloadDataAction } from './getDownloadData';
import { getGdprQueryScopesAction } from './getGdprScopes';
import { getServiceConnectionsAction } from './getServiceConnections';
import { loadKeycloakConfigAction } from './loadKeycloakConfig';
import { createRedirectorAndCatcherActionProps } from './redirectionHandlers';

export function getQueue(
  name: 'downloadProfile' | 'deleteProfile' | 'removeServiceConnection',
  path: string
) {
  const [
    redirectorAction,
    catcherAction,
  ] = createRedirectorAndCatcherActionProps(path);
  if (name === 'downloadProfile') {
    return [
      getServiceConnectionsAction,
      getGdprQueryScopesAction,
      tunnistamoRedirectionInitializationAction,
      tunnistamoAuthCodeRedirectionAction,
      tunnistamoAuthCodeCallbackUrlAction,
      tunnistamoAuthCodeParserAction,
      loadKeycloakConfigAction,
      keycloakRedirectionInitializationAction,
      keycloakAuthCodeRedirectionAction,
      keycloakAuthCodeCallbackUrlAction,
      keycloakAuthCodeParserAction,
      redirectorAction,
      catcherAction,
      getDownloadDataAction,
      downloadAsFileAction,
    ];
  }
  return [];
}