import _ from 'lodash';
import { FetchResult } from '@apollo/client';

import { formConstants } from '../constants/formConstants';
import profileConstants from '../constants/profileConstants';
import getAddressesFromNode from './getAddressesFromNode';
import getEmailsFromNode from './getEmailsFromNode';
import getPhonesFromNode from './getPhonesFromNode';
import {
  ProfileRoot,
  ProfileData,
  UpdateProfileRoot,
  AddressNode,
  EmailNode,
  PhoneNode,
  PrimaryAddress,
  PrimaryEmail,
  PrimaryPhone,
  Language,
  Mutable,
} from '../../graphql/typings';

type UserData = Pick<ProfileData, 'firstName' | 'nickname' | 'lastName'>;
export type AddressData = Mutable<
  Pick<
    AddressNode,
    'address' | 'city' | 'postalCode' | 'countryCode' | 'primary'
  >
>;

export type EmailData = Mutable<Pick<EmailNode, 'email' | 'primary'>>;
export type PhoneData = Mutable<Pick<PhoneNode, 'phone' | 'primary'>>;

export type EditableUserData = Mutable<UserData>;
export type EditableAddress = Mutable<AddressData>;
export type EditableEmail = Mutable<EmailData>;
export type EditablePhone = Mutable<PhoneData>;

export type AdditionalInformation = {
  id: string;
  profileLanguage: Language;
};

export type EditableAdditionalInformation = Mutable<AdditionalInformation>;

export type UpdateResult = FetchResult<UpdateProfileRoot>;

export interface BasicData extends UserData {
  id: string;
}

export type FormValues = {
  firstName: string;
  nickname: string;
  lastName: string;
  primaryEmail: PrimaryEmail;
  primaryAddress: PrimaryAddress;
  primaryPhone: PrimaryPhone;
  profileLanguage: Language;
  addresses: AddressNode[];
  emails: EmailNode[];
  phones: PhoneNode[];
};

export const basicDataType = 'basic-data';
export const additionalInformationType = 'additional-information';

export type EditData = {
  primary?: boolean;
  profileData:
    | PhoneNode
    | EmailNode
    | AddressNode
    | BasicData
    | AdditionalInformation;
  value:
    | string
    | undefined
    | EditableAddress
    | EditableUserData
    | EditableAdditionalInformation;
  dataType:
    | 'phones'
    | 'emails'
    | 'addresses'
    | typeof basicDataType
    | typeof additionalInformationType;
};

export type MatchResults = {
  items: EditData[];
  hasChanged: boolean;
};

export type Action =
  | 'edit'
  | 'remove'
  | 'set-primary'
  | 'cancel'
  | 'save'
  | 'add';

export type ActionListenerReturnType = Promise<void | UpdateResult>;
export type ActionListener = (
  action: Action,
  data: EditData
) => ActionListenerReturnType;

export function pickProfileData(
  myProfileQuery: ProfileRoot,
  dataType: EditData['dataType']
): EditData['profileData'][] {
  const profile = myProfileQuery && myProfileQuery.myProfile;
  if (!profile) {
    return [];
  }
  if (dataType === 'phones') {
    const list: PhoneNode[] = getPhonesFromNode(myProfileQuery);
    const primary = profile.primaryPhone;
    if (primary) {
      list.unshift({ ...primary });
    }
    return list;
  }
  if (dataType === 'emails') {
    const list: EmailNode[] = getEmailsFromNode(myProfileQuery);
    const primary = profile.primaryEmail;
    if (primary) {
      list.unshift({ ...primary });
    }
    return list;
  }
  if (dataType === 'addresses') {
    const list: AddressNode[] = getAddressesFromNode(myProfileQuery);
    const primary = profile.primaryAddress;
    if (primary) {
      list.unshift({ ...primary });
    }
    return list;
  }
  if (dataType === basicDataType) {
    const { firstName, nickname, lastName, id } = profile;
    return [
      {
        id,
        firstName,
        nickname,
        lastName,
      },
    ];
  }
  if (dataType === additionalInformationType) {
    const { language: profileLanguage } = profile;
    return [
      {
        id: '',
        profileLanguage:
          profileLanguage || (profileConstants.LANGUAGES[0] as Language),
      },
    ];
  }
  return [];
}

export function createEditData(
  myProfileQuery: ProfileRoot | undefined,
  dataType: EditData['dataType']
): EditData[] {
  const profile = myProfileQuery && myProfileQuery.myProfile;
  if (!profile) {
    return [];
  }
  const targetData = pickProfileData(myProfileQuery as ProfileRoot, dataType);
  return targetData.map(targetProfileData =>
    createEditItem(dataType, targetProfileData)
  );
}

export function createEditDataValueFromProfileData(
  profileDataItem: EditData['profileData'],
  dataType: EditData['dataType']
): EditData['value'] {
  if (dataType === 'phones') {
    return (profileDataItem as PhoneNode).phone || '';
  }
  if (dataType === 'emails') {
    return (profileDataItem as EmailNode).email || '';
  }
  if (dataType === 'addresses') {
    const {
      postalCode,
      address,
      city,
      countryCode,
      primary,
    } = profileDataItem as AddressNode;
    return {
      postalCode,
      address,
      city,
      countryCode,
      primary,
    };
  }
  if (dataType === basicDataType) {
    const { firstName, nickname, lastName } = profileDataItem as BasicData;
    return {
      firstName,
      nickname,
      lastName,
    };
  }
  if (dataType === additionalInformationType) {
    const { profileLanguage } = profileDataItem as AdditionalInformation;
    return {
      id: '',
      profileLanguage,
    };
  }
  return '';
}

export function createEditItem(
  dataType: EditData['dataType'],
  targetProfileData: EditData['profileData']
): EditData {
  return {
    profileData: targetProfileData,
    value: createEditDataValueFromProfileData(targetProfileData, dataType),
    primary: isPrimary(targetProfileData, dataType),
    dataType,
  };
}

function isPrimary(
  profileDataItem: EditData['profileData'],
  dataType: EditData['dataType']
): boolean {
  if (dataType === 'phones') {
    return (profileDataItem as PhoneNode).primary === true;
  }
  if (dataType === 'emails') {
    return (profileDataItem as EmailNode).primary === true;
  }
  if (dataType === 'addresses') {
    return (profileDataItem as AddressNode).primary === true;
  }
  return false;
}

export function updateProfileDataFromEditData(
  item: EditData
): EditData['profileData'] {
  const { profileData, dataType, value } = item;
  if (dataType === 'phones') {
    (profileData as EditablePhone).phone = value as string;
  }
  if (dataType === 'emails') {
    (profileData as EditableEmail).email = value as string;
  }
  if (dataType === 'addresses') {
    const target = profileData as EditableAddress;
    const source = value as EditableAddress;
    target.address = source.address;
    target.postalCode = source.postalCode;
    target.countryCode = source.countryCode;
    target.city = source.city;
  }
  if (dataType === basicDataType) {
    const target = profileData as EditableUserData;
    const source = value as EditableUserData;
    target.firstName = source.firstName;
    target.nickname = source.nickname;
    target.lastName = source.lastName;
  }
  if (dataType === additionalInformationType) {
    const target = profileData as EditableAdditionalInformation;
    const source = value as EditableAdditionalInformation;
    target.profileLanguage = source.profileLanguage;
  }
  return profileData;
}

function findExistingItem(
  dataItems: EditData[],
  profileDataItem: EditData['profileData']
): EditData | undefined {
  return findEditItem(dataItems, profileDataItem && profileDataItem.id);
}

function findEditItem(dataItems: EditData[], id: string): EditData | undefined {
  return dataItems.find(dataItem => id === dataItem.profileData.id);
}

export function findEditItemIndex(
  dataItems: EditData[],
  idOrEditData: string | EditData
): number {
  const itemId =
    typeof idOrEditData === 'string'
      ? idOrEditData
      : idOrEditData.profileData.id;
  return dataItems.findIndex(dataItem => itemId === dataItem.profileData.id);
}

export function mergeOldEditDataToNewProfileData(
  dataItems: EditData[],
  profileDataItems: EditData['profileData'][],
  dataType: EditData['dataType']
): MatchResults {
  const stats: MatchResults = {
    items: [],
    hasChanged: false,
  };
  if (dataType === basicDataType) {
    const editDataItem = dataItems[0];
    const currentUserData = createEditDataValueFromProfileData(
      editDataItem.profileData,
      dataType
    ) as EditableUserData;
    const newUserData = createEditDataValueFromProfileData(
      profileDataItems[0],
      dataType
    ) as EditableUserData;
    const userDataChanged = !_.isEqual(currentUserData, newUserData);
    if (userDataChanged) {
      stats.hasChanged = true;
      editDataItem.value = newUserData;
      editDataItem.profileData = profileDataItems[0];
    }
    stats.items.push(editDataItem);
    return stats;
  }

  if (dataType === additionalInformationType) {
    const editDataItem = dataItems[0];
    const {
      profileLanguage,
    } = editDataItem.value as EditableAdditionalInformation;
    const { profileLanguage: newLanguage } = createEditDataValueFromProfileData(
      profileDataItems[0],
      dataType
    ) as EditableAdditionalInformation;
    stats.hasChanged = !_.isEqual(profileLanguage, newLanguage);
    if (stats.hasChanged) {
      (editDataItem.value as EditableAdditionalInformation).profileLanguage = newLanguage;
    }
    stats.items.push(editDataItem);
    return stats;
  }
  let existingNewItem = findEditItem(dataItems, '');
  profileDataItems.forEach(profileDataItem => {
    const profileDataValue = createEditDataValueFromProfileData(
      profileDataItem,
      dataType
    );
    const profileDataIsPrimary = isPrimary(profileDataItem, dataType);
    const existingItem = findExistingItem(dataItems, profileDataItem);
    if (existingItem) {
      if (!stats.hasChanged) {
        stats.hasChanged =
          !_.isEqual(existingItem.value, profileDataValue) ||
          existingItem.primary !== profileDataIsPrimary;
      }
      existingItem.value = profileDataValue;
      existingItem.primary = profileDataIsPrimary;
      existingItem.profileData = profileDataItem;
      stats.items.push(existingItem);
    } else {
      if (
        existingNewItem &&
        _.isEqual(existingNewItem.value, profileDataValue)
      ) {
        existingNewItem.profileData = profileDataItem;
        stats.items.push(existingNewItem);
        existingNewItem = undefined;
      } else {
        stats.items.push(createEditItem(dataType, profileDataItem));
      }
    }
  });
  if (!stats.hasChanged && dataItems.length !== profileDataItems.length) {
    stats.hasChanged = true;
  }
  if (existingNewItem) {
    stats.items.push(existingNewItem);
  }
  return stats;
}

export function collectProfileData(
  dataItems: EditData[],
  dataType: EditData['dataType']
): Partial<FormValues> {
  const data = dataItems
    .filter(dataItem => !!dataItem && !!dataItem.profileData)
    .map(dataItem => dataItem.profileData);
  if (dataType === 'phones') {
    return {
      phones: data as PhoneNode[],
    };
  }
  if (dataType === 'emails') {
    return {
      emails: data as EmailNode[],
    };
  }
  if (dataType === 'addresses') {
    return {
      addresses: data as AddressNode[],
    };
  }
  if (dataType === additionalInformationType) {
    const { profileLanguage } = data[0] as AdditionalInformation;
    return { profileLanguage };
  }
  const { firstName, nickname, lastName } = data[0] as BasicData;
  return { firstName, nickname, lastName };
}

export function createNewEditItem(dataType: EditData['dataType']): EditData {
  const newProfileData = createNewProfileData(dataType);
  return createEditItem(dataType, newProfileData);
}

export function isNew(data: EditData): boolean {
  return data.profileData.id === '';
}

export function createNewProfileData(
  dataType: EditData['dataType']
): EditData['profileData'] {
  return {
    ...(formConstants.EMPTY_VALUES[dataType] as EditData['profileData']),
  };
}

export function hasNewItem(data: EditData[]): boolean {
  return !!findEditItem(data, '');
}

export function setNewPrimary(
  dataItems: EditData[],
  newPrimary: EditData
): EditData[] | null {
  const { clonedData, clonedItem } = cloneDataAndGetCurrentClone(
    dataItems,
    newPrimary
  );
  const currentPrimary = clonedData[0].primary ? clonedData[0] : null;
  const newPrimaryIndex = findEditItemIndex(clonedData, clonedItem);

  if (newPrimaryIndex === -1 || !clonedItem.profileData.id) {
    throw new Error('cannot set selected item as new primary');
  }
  if (
    currentPrimary &&
    currentPrimary.profileData.id === clonedItem.profileData.id
  ) {
    return null;
  }

  if (currentPrimary) {
    currentPrimary.primary = false;
    (currentPrimary.profileData as
      | EditableEmail
      | EditablePhone
      | EditableAddress).primary = false;
  }
  clonedItem.primary = true;
  (clonedItem.profileData as
    | EditableEmail
    | EditablePhone
    | EditableAddress).primary = true;

  clonedData.splice(newPrimaryIndex, 1);
  clonedData.unshift(clonedItem);
  return clonedData;
}

export function resetEditDataValue(editData: EditData): EditData['value'] {
  const valueFromProfileData = createEditDataValueFromProfileData(
    editData.profileData,
    editData.dataType
  );
  editData.value = valueFromProfileData;
  return valueFromProfileData;
}

export function cloneData(dataItems: EditData[]): EditData[] {
  const cloneValue =
    dataItems[0] &&
    (dataItems[0].dataType === 'addresses' ||
      dataItems[0].dataType === basicDataType);
  const newList = dataItems.map(dataItem => {
    const clone = { ...dataItem };
    if (cloneValue) {
      clone.value = {
        ...(dataItem.value as EditableUserData | EditableAddress),
      };
    }
    return clone;
  });
  newList.forEach(newDataItem => {
    newDataItem.profileData = { ...newDataItem.profileData };
  });
  return newList;
}

export function cloneDataAndGetCurrentClone(
  dataItems: EditData[],
  currentItem: EditData
): { clonedData: EditData[]; clonedItem: EditData } {
  const clonedData = cloneData(dataItems);
  const clonedItem = findEditItem(clonedData, currentItem.profileData.id);
  if (!clonedItem) {
    throw new Error('item not found in new data list');
  }
  return { clonedData, clonedItem };
}
