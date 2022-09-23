import { useCallback } from 'react';
import {
  MutationHookOptions,
  MutationResult,
  useMutation,
} from '@apollo/client';
import { loader } from 'graphql.macro';

import useServiceConnectionsAuthorizationCode, {
  LoadStatus,
} from './useServiceConnectionsAuthorizationCode';
import {
  GdprDeleteMyServiceDataMutationVariables,
  GdprDeleteMyServiceDataMutation,
} from '../graphql/generatedTypes';

const DELETE_SERVICE_DATA = loader('./graphql/GdprDeleteServiceData.graphql');

type ReturnTuple = [
  () => void,
  MutationResult<GdprDeleteMyServiceDataMutation>,
  LoadStatus
];

function useDeleteServiceConnection(
  serviceName: string,
  options: MutationHookOptions<
    GdprDeleteMyServiceDataMutation,
    GdprDeleteMyServiceDataMutationVariables
  >
): ReturnTuple {
  const [deleteServiceData, queryResult] = useMutation<
    GdprDeleteMyServiceDataMutation,
    GdprDeleteMyServiceDataMutationVariables
  >(DELETE_SERVICE_DATA, {
    ...options,
  });

  const handleAuthorizationCodeCallback = useCallback(
    (authorizationCode: string) => {
      const variablesWithAuthorizationCode = {
        input: {
          authorizationCode,
          serviceName,
          dryRun: true,
        },
      };

      deleteServiceData({
        variables: variablesWithAuthorizationCode,
      });
    },
    [deleteServiceData, serviceName]
  );

  const [
    getAuthorizationCode,
    authorizationCodeStatus,
  ] = useServiceConnectionsAuthorizationCode({
    onCompleted: e => {
      handleAuthorizationCodeCallback(e);
    },
    onError: options?.onError,
  });

  return [getAuthorizationCode, queryResult, authorizationCodeStatus];
}

export default useDeleteServiceConnection;