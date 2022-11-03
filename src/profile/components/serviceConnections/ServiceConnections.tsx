import React from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import * as Sentry from '@sentry/browser';
import { Button, LoadingSpinner, Notification } from 'hds-react';
import classNames from 'classnames';

import Explanation from '../../../common/explanation/Explanation';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import CheckedLabel from '../../../common/checkedLabel/CheckedLabel';
import styles from './ServiceConnections.module.css';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import {
  ServiceConnectionsQueryVariables,
  ServiceConnectionsRoot,
} from '../../../graphql/typings';
import getServiceConnectionData from '../../helpers/getServiceConnectionData';
import getAllowedDataFieldsFromService from '../../helpers/getAllowedDataFieldsFromService';
import createServiceConnectionsQueryVariables from '../../helpers/createServiceConnectionsQueryVariables';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import DeleteServiceConnection from './DeleteServiceConnection';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

function ServiceConnections(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { data, loading, refetch, error } = useQuery<
    ServiceConnectionsRoot,
    ServiceConnectionsQueryVariables
  >(SERVICE_CONNECTIONS, {
    variables: createServiceConnectionsQueryVariables(i18n.language),
    notifyOnNetworkStatusChange: true,
    onError: (loadError: Error) => {
      Sentry.captureException(loadError);
    },
  });

  const getDateTime = (date: Date) => {
    const day = format(new Date(date), 'dd.MM.yyyy');
    const time = format(new Date(date), 'HH:mm');
    return `${day}, ${t('serviceConnections.clock')} ${time}`;
  };

  const ContentWrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => (
    <div
      className={classNames([
        commonContentStyles['common-bottom-padding'],
        commonContentStyles['content'],
      ])}
    >
      <div className={classNames([commonContentStyles['common-content-area']])}>
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <ContentWrapper>
        <div
          className={styles['load-indicator']}
          data-testid={'load-indicator'}
        >
          <LoadingSpinner small />
          <span>{t('loading')}</span>
        </div>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <Notification
        type={'error'}
        label={t('notification.genericError')}
        dataTestId={'service-connections-load-error'}
      >
        <p>{t('notification.defaultErrorText')}</p>
        <Button
          onClick={() => {
            refetch();
          }}
        >
          {t('notification.tryAgain')}
        </Button>
      </Notification>
    );
  }

  const services = getServiceConnectionData(data);
  const hasNoServices = !loading && services.length === 0;
  const onServiceConnectionDeleted = () => {
    refetch();
  };
  return (
    <ContentWrapper>
      <Explanation
        heading={t('serviceConnections.title')}
        text={
          hasNoServices
            ? t('serviceConnections.empty')
            : t('serviceConnections.explanation')
        }
        dataTestId="service-connections-explanation"
      />
      <ProfileSection>
        <div className={styles['panel-container']}>
          {services.map((service, index) => (
            <ExpandingPanel
              key={index}
              title={service.title || ''}
              showInformationText
              initiallyOpen={false}
            >
              <p>{service.description}</p>
              <p className={styles['service-information']}>
                {t('serviceConnections.servicePersonalData')}
              </p>
              {getAllowedDataFieldsFromService(service).map(node => (
                <CheckedLabel
                  key={node.fieldName}
                  value={node.label || node.fieldName}
                  className={styles['allowed-data-field']}
                />
              ))}
              <p className={styles['created-at']}>
                {t('serviceConnections.created')}
              </p>
              <p className={styles['date-and-time']}>
                {getDateTime(service.connectionCreatedAt)}
              </p>
              <DeleteServiceConnection
                service={service}
                onDeletion={onServiceConnectionDeleted}
              />
            </ExpandingPanel>
          ))}
        </div>
      </ProfileSection>
    </ContentWrapper>
  );
}

export default ServiceConnections;
