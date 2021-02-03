import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import * as Sentry from '@sentry/browser';
import FileSaver from 'file-saver';
import { useHistory } from 'react-router';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import DeleteProfile from '../deleteProfile/DeleteProfile';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import DownloadData from '../downloadData/DownloadData';
import styles from './ProfileInformation.module.css';
import {
  DownloadMyProfileQuery,
  MyProfileQuery,
} from '../../../graphql/generatedTypes';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import useDownloadProfile from '../../../gdprApi/useDownloadProfile';
import useDeleteProfile from '../../../gdprApi/useDeleteProfile';
import checkBerthError from '../../helpers/checkBerthError';
import BerthErrorModal from '../modals/berthError/BerthErrorModal';
import ProfileInformationAccountManagementLink from './ProfileInformationAccountManagementLink';
import useToast from '../../../toast/useToast';
import ProfileDataEditor from '../ProfileDataEditor/ProfileDataEditor';
import EditableBasicData from '../editableBasicData/EditableBasicData';

const ALL_DATA = loader('../../graphql/DownloadMyProfileQuery.graphql');

type Props = {
  loading: boolean;
  data: MyProfileQuery;
};

function ProfileInformation(props: Props): React.ReactElement {
  const history = useHistory();
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();
  const [berthError, setBerthError] = useState(false);
  const { createToast } = useToast();

  // useDownloadProfile and useDeleteProfile need to be mounted when
  // the page they are on is first rendered. That's why it's sensible to
  // manage them in a component that makes the root of a route.
  const [downloadProfileData, downloadQueryResult] = useDownloadProfile<
    DownloadMyProfileQuery
  >(ALL_DATA, {
    onCompleted: returnedData => {
      const blob = new Blob([returnedData.downloadMyProfile], {
        type: 'application/json',
      });
      FileSaver.saveAs(blob, 'helsinkiprofile_data.json');
    },
    onError: (error: Error) => {
      Sentry.captureException(error);
      createToast({ type: 'error' });
    },
    fetchPolicy: 'network-only',
  });
  const [deleteProfile, deleteProfileResult] = useDeleteProfile({
    onCompleted: returnedData => {
      if (returnedData) {
        trackEvent({ category: 'action', action: 'Delete profile' });
        history.push('/profile-deleted');
      }
    },
    onError: error => {
      if (checkBerthError(error.graphQLErrors)) {
        setBerthError(true);
      } else {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      }
    },
  });

  const isDownloadingProfile = downloadQueryResult.loading;
  const isDeletingProfile = deleteProfileResult.loading;

  const { loading, data } = props;
  return (
    <Fragment>
      {loading && t('loading')}
      {data && (
        <Fragment>
          <EditableBasicData />
          <ProfileDataEditor dataType="emails" />
          <ProfileDataEditor dataType="phones" />
          <ProfileSection title={''}>
            <h3 className={styles.sectionTitle}>
              {t('profileForm.additionalInfo')}
            </h3>
            <div className={styles.storedInformation}>
              <LabeledValue
                label={t('profileForm.language')}
                value={t(`LANGUAGE_OPTIONS.${data.myProfile?.language}`)}
              />
            </div>
          </ProfileSection>
        </Fragment>
      )}
      <div className={styles.boxGrid}>
        <ProfileInformationAccountManagementLink />
        <DownloadData
          isDownloadingData={isDownloadingProfile}
          isOpenByDefault={isDownloadingProfile}
          onDownloadClick={downloadProfileData}
        />
        <DeleteProfile
          onDelete={deleteProfile}
          isOpenByDefault={isDeletingProfile}
        />
      </div>
      <BerthErrorModal
        isOpen={berthError}
        onClose={() => setBerthError(prevState => !prevState)}
      />
    </Fragment>
  );
}

export default ProfileInformation;
