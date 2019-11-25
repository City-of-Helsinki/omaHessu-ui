import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TextInput } from 'hds-react';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

import Button from '../../../common/button/Button';
import styles from './CreateProfileForm.module.css';

const schema = yup.object().shape({
  firstName: yup.string(),
  lastName: yup.string(),
  phone: yup.string().min(6, 'validation.phoneMin'),
  terms: yup.boolean().oneOf([true], 'validation.required'),
});

type Props = {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: {}) => Promise<any>;
};

function CreateProfileForm(props: Props) {
  const { t } = useTranslation();
  return (
    <Formik
      initialValues={{
        ...props.profile,
        terms: false,
      }}
      initialErrors={{
        terms: 'validation.required',
      }}
      onSubmit={values => {
        return props.onSubmit({
          firstName: values.firstName,
          lastName: values.lastName,
          email: props.profile.email,
          phone: values.phone,
        });
      }}
      validationSchema={schema}
    >
      {({ errors, isSubmitting, submitCount }) => (
        <Form noValidate>
          <div className={styles.formFields}>
            <Field
              className={styles.formField}
              name="firstName"
              id="firstName"
              as={TextInput}
              invalid={submitCount && errors.firstName}
              invalidText={
                submitCount && errors.firstName && t(errors.firstName)
              }
              labelText={t('profileForm.firstName')}
            />
            <Field
              className={styles.formField}
              name="lastName"
              id="lastName"
              as={TextInput}
              invalid={submitCount && errors.lastName}
              invalidText={submitCount && errors.lastName && t(errors.lastName)}
              labelText={t('profileForm.lastName')}
            />
            <div className={styles.formField}>
              <label className={styles.label}>{t('profileForm.email')}</label>
              <span className={styles.email}>{props.profile.email}</span>
            </div>
            <Field
              className={styles.formField}
              name="phone"
              id="phone"
              as={TextInput}
              type="tel"
              minlength="6"
              invalid={submitCount && errors.phone}
              invalidText={
                submitCount && errors.phone && t(errors.phone, { min: 6 })
              }
              labelText={t('profileForm.phone')}
            />
          </div>
          <label className={styles.terms}>
            <Field name="terms" type="checkbox" />{' '}
            <Trans
              i18nKey="profileForm.terms"
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              components={[<a href="/tos"></a>]}
            />
          </label>
          <div>
            <Button
              type="submit"
              disabled={Boolean(isSubmitting || errors.terms)}
            >
              {t('profileForm.submit')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default CreateProfileForm;
