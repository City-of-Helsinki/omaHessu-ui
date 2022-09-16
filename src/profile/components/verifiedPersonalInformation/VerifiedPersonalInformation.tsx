import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import classNames from 'classnames';

import styles from './VerifiedPersonalInformation.module.css';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useVerifiedPersonalInformation } from '../../context/ProfileContext';
import getCountry from '../../helpers/getCountry';
import {
  PermanentForeignAddress,
  PermanentAddress,
} from '../../../graphql/typings';
import { Link } from '../../../common/copyOfHDSLink/Link';

type CommonAddress = {
  streetAddress: PermanentAddress['streetAddress'];
  postOffice?: PermanentAddress['postOffice'];
  postalCode?: PermanentAddress['postalCode'];
  additionalAddress?: PermanentForeignAddress['additionalAddress'];
  countryCode?: PermanentForeignAddress['countryCode'];
  __typename: string;
};

type AddressProps = {
  type: 'permanent' | 'foreign';
  address: CommonAddress;
};

function VerifiedPersonalInformation(): React.ReactElement | null {
  const verifiedPersonalInformation = useVerifiedPersonalInformation();

  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];

  if (!verifiedPersonalInformation) {
    return null;
  }

  const {
    firstName,
    givenName,
    lastName,
    permanentAddress,
    permanentForeignAddress,
    nationalIdentificationNumber,
    municipalityOfResidence,
  } = verifiedPersonalInformation;

  const titleStyle = commonFormStyles['section-title'];

  const AddressComponent = (props: AddressProps): React.ReactElement | null => {
    const { type } = props;
    const address = props.address;
    if (!address) {
      return null;
    }
    const country = getCountry(address.countryCode, lang);
    return (
      <React.Fragment key={type}>
        <div
          className={commonFormStyles['multi-item-wrapper']}
          data-testid={`vpi-address-${type}`}
        >
          <LabeledValue
            label={t('profileForm.address')}
            value={address.streetAddress}
          />
          {address.additionalAddress && (
            <LabeledValue
              label={t('profileForm.additionalInfo')}
              value={address.additionalAddress}
            />
          )}
          {address.postalCode && (
            <LabeledValue
              label={t('profileForm.postalCode')}
              value={address.postalCode}
            />
          )}
          {address.postOffice && (
            <LabeledValue
              label={t('profileForm.postOffice')}
              value={address.postOffice}
            />
          )}
          {country && (
            <LabeledValue label={t('profileForm.country')} value={country} />
          )}
        </div>
      </React.Fragment>
    );
  };

  const LongDescription = () => (
    <p>
      <Trans
        i18nKey={'profileInformation.verifiedDataInformation'}
        components={{
          suomiFiLink: (
            <Link
              href={t('profileInformation.verifiedDataInformationLink')}
              external
              openInNewTab
            >
              {''}
            </Link>
          ),
        }}
      />
    </p>
  );

  return (
    <ProfileSection hasVerifiedUserData>
      <div
        className={classNames(
          commonFormStyles['section-title-with-explanation'],
          styles['verified-data-explanation']
        )}
      >
        <h2 className={titleStyle}>
          {t('profileInformation.verifiedBasicData')}
        </h2>
        <LongDescription />
      </div>

      <div className={commonFormStyles['multi-item-wrapper']}>
        <LabeledValue label={t('profileForm.firstName')} value={firstName} />
        <LabeledValue label={t('profileForm.givenName')} value={givenName} />
        <LabeledValue label={t('profileForm.lastName')} value={lastName} />
        <LabeledValue
          label={t('profileForm.nationalIdentificationNumber')}
          value={nationalIdentificationNumber}
        />
        <LabeledValue
          label={t('profileForm.municipalityOfResidence')}
          value={municipalityOfResidence}
        />
      </div>
      <AddressComponent
        type="permanent"
        address={permanentAddress as CommonAddress}
      />
      <AddressComponent
        type="foreign"
        address={permanentForeignAddress as CommonAddress}
      />
    </ProfileSection>
  );
}

export default VerifiedPersonalInformation;
