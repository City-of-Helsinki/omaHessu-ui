import { TFunction } from 'i18next';

import { ActionAriaLabels } from '../components/editableRow/Actions';
import { EditableAddress, EditData } from './mutationEditor';

export default function createActionAriaLabels(
  editData: EditData,
  t: TFunction
): ActionAriaLabels {
  const dataType = editData.dataType;
  if (dataType === 'phones' || dataType === 'emails') {
    const { value } = editData;
    const labelForType =
      dataType === 'phones'
        ? t('profileInformation.phone')
        : t('profileInformation.email');

    const editTranslation =
      dataType === 'phones'
        ? t('profileInformation.ariaEditPhone')
        : t('profileInformation.ariaEditEmail');

    const primaryTranslation =
      dataType === 'phones'
        ? t('profileInformation.primaryPhone')
        : t('profileInformation.primaryEmail');

    return {
      edit: `${t(editTranslation)} ${value}`,
      primary: `${t(primaryTranslation)} ${labelForType}`,
      setPrimary: `${t('profileForm.setPrimary')} ${labelForType} ${value}`,
      remove: `${t('profileInformation.remove')} ${labelForType} ${value}`,
    };
  }
  if (dataType === 'addresses') {
    // format "Muokkaa osoitetta {value}"
    const value = (editData.value as EditableAddress).address;
    return {
      edit: `${t('profileInformation.ariaEditAddress')} ${value}`,
      primary: `${t('profileInformation.primaryAddress')} ${value}`,
      setPrimary: `${t('profileForm.setPrimary')} ${t(
        'profileInformation.address'
      )} ${value}`,
      remove: `${t('profileForm.remove')} ${t(
        'profileInformation.address'
      )} ${value}`,
    };
  }
  //basicData
  return {
    edit: t('profileInformation.ariaEditBasicData'),
  };
}
