import React, { Fragment, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Link } from 'hds-react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import DownloadData from '../downloadData/DownloadData';
import AuthenticationProviderInformation from './AuthenticationProviderInformation';
import { ProfileContext } from '../../context/ProfileContext';
import BasicData from '../basicData/BasicData';
import EmailEditor from '../emailEditor/EmailEditor';
import AdditionalInformation from '../additionalInformation/AdditionalInformation';
import VerifiedPersonalInformation from '../verifiedPersonalInformation/VerifiedPersonalInformation';
import getVerifiedPersonalInformation from '../../helpers/getVerifiedPersonalInformation';
import Explanation from '../../../common/explanation/Explanation';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import AddressEditor from '../addressEditor/AddressEditor';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import MultiItemEditor from '../multiItemEditor/MultiItemEditor';

function ProfileInformation(): React.ReactElement {
  const { data } = useContext(ProfileContext);
  const { t } = useTranslation();
  const hasVerifiedData = !!getVerifiedPersonalInformation(data);
  const UserDataComponent = hasVerifiedData
    ? VerifiedPersonalInformation
    : BasicData;
  return (
    <div className={classNames([commonContentStyles['content']])}>
      <div className={classNames([commonContentStyles['common-content-area']])}>
        <Explanation
          heading={t('profileInformation.title')}
          text={
            <Trans
              i18nKey="profileInformation.description"
              components={{
                linkToServices: (
                  <Link href={'/connected-services'} size="M">
                    {''}
                  </Link>
                ),
                linkToServicesText: t('nav.services'),
              }}
            />
          }
          dataTestId="profile-information-explanation"
          useHeadingHeroStyle
        />
        {data && (
          <Fragment>
            <UserDataComponent />
            <AddressEditor />
            <ProfileSection>
              <div className={commonFormStyles['editor-description-container']}>
                <h2>{t('profileInformation.contact')}</h2>
              </div>
              <MultiItemEditor dataType="phones" />
              <hr />
              <EmailEditor />
            </ProfileSection>
            <AdditionalInformation />
          </Fragment>
        )}
        <AuthenticationProviderInformation />
      </div>
      <div
        className={classNames([
          commonContentStyles['content'],
          commonContentStyles['common-content-area-dark-bg'],
          commonContentStyles['common-bottom-padding'],
        ])}
      >
        <div
          className={classNames([commonContentStyles['common-content-area']])}
        >
          <DownloadData />
          <DeleteProfile />
        </div>
      </div>
    </div>
  );
}

export default ProfileInformation;
