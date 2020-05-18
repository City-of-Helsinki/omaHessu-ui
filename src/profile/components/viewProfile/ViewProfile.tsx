import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import { Switch, Route, NavLink } from 'react-router-dom';
import classNames from 'classnames';
import * as Sentry from '@sentry/browser';

import styles from './ViewProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import PageHeading from '../../../common/pageHeading/PageHeading';
import ProfileInformation from '../profileInformation/ProfileInformation';
import EditProfile from '../editProfile/EditProfile';
import getNicknameOrName from '../../helpers/getNicknameOrName';
import ServiceConnections from '../serviceConnections/ServiceConnections';
import Subscriptions from '../../../subscriptions/components/subsciptions/Subscriptions';
import { MyProfileQuery } from '../../../graphql/generatedTypes';
import NotificationComponent from '../../../common/notification/NotificationComponent';
import Explanation from '../../../common/explanation/Explanation';

const MY_PROFILE = loader('../../graphql/MyProfileQuery.graphql');

function ViewProfile() {
  const [isEditing, setEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { t } = useTranslation();

  const { data, loading } = useQuery<MyProfileQuery>(MY_PROFILE, {
    onError: (error: Error) => {
      Sentry.captureException(error);
      setShowNotification(true);
    },
  });

  const toggleEditing = () => {
    setEditing(prevState => !prevState);
  };

  return (
    <div className={styles.viewProfile}>
      {data && (
        <React.Fragment>
          <PageHeading text={getNicknameOrName(data)} />
          <nav
            className={classNames(
              styles.profileNav,
              responsive.maxWidthCentered
            )}
          >
            <NavLink
              exact
              to="/"
              className={styles.profileNavLink}
              activeClassName={styles.activeProfileNavLink}
            >
              {t('nav.information')}
            </NavLink>
            <NavLink
              exact
              to="/connected-services"
              className={styles.profileNavLink}
              activeClassName={styles.activeProfileNavLink}
            >
              {t('nav.services')}
            </NavLink>
            {process.env.REACT_APP_ENVIRONMENT !== 'production' && (
              <NavLink
                exact
                to="/subscriptions"
                className={styles.profileNavLink}
                activeClassName={styles.activeProfileNavLink}
              >
                {t('nav.subscriptions')}
              </NavLink>
            )}
          </nav>
          <Switch>
            <Route path="/connected-services">
              <ServiceConnections />
            </Route>
            {process.env.REACT_APP_ENVIRONMENT !== 'production' && (
              <Route path="/subscriptions">
                <Subscriptions />
              </Route>
            )}
            <Route path="/">
              <div className={styles.profileContent}>
                <div className={responsive.maxWidthCentered}>
                  <Explanation main={t('profileInformation.title')} />
                  {!isEditing ? (
                    <ProfileInformation
                      data={data}
                      loading={loading}
                      isEditing={isEditing}
                      setEditing={toggleEditing}
                    />
                  ) : (
                    <EditProfile
                      setEditing={toggleEditing}
                      profileData={data}
                    />
                  )}
                </div>
              </div>
            </Route>
          </Switch>
        </React.Fragment>
      )}

      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default ViewProfile;
