import React, { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Switch, Route, Link } from 'react-router-dom';
import classNames from 'classnames';

import styles from './ViewProfile.module.css';
import PageHeading from '../../../common/pageHeading/PageHeading';
import ProfileInformation from '../profileInformation/ProfileInformation';
import ServiceConnections from '../serviceConnections/ServiceConnections';
import Explanation from '../../../common/explanation/Explanation';
import { ProfileContext } from '../../context/ProfileContext';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import TopSectionWithKoros from '../../../common/topSectionWithKoros/TopSectionWithKoros';

function ViewProfile(): React.ReactElement {
  const { t } = useTranslation();
  const { isComplete, getName } = useContext(ProfileContext);

  return (
    <React.Fragment>
      {isComplete && (
        <React.Fragment>
          <TopSectionWithKoros>
            <PageHeading
              text={getName(true)}
              dataTestId="view-profile-heading"
            />
          </TopSectionWithKoros>
          <div
            className={classNames([
              commonContentStyles['common-content-area'],
              commonContentStyles['common-bottom-padding'],
              styles['content'],
            ])}
          >
            <Switch>
              <Route path="/connected-services">
                <ServiceConnections />
              </Route>
              <Route path="/">
                <Explanation
                  heading={t('profileInformation.title')}
                  text={
                    <Trans
                      i18nKey="profileInformation.description"
                      components={{
                        linkToServices: (
                          <Link to={'/connected-services'}>{''}</Link>
                        ),
                        linkToServicesText: t('nav.services'),
                      }}
                    />
                  }
                />
                <ProfileInformation />
              </Route>
            </Switch>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default ViewProfile;
