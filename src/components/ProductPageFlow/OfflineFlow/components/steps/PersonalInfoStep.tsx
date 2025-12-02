/**
 * Offline Flow - Kişisel Bilgiler Step Bileşeni
 */

'use client';

import { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { JOB_OPTIONS, getStorageKeys } from '../../config/offlineConstants';
import { Job, OfflineBranchConfig, OfflineFormData } from '../../types';
import { validateTCKNFull, validateTaxNumber } from '@/utils/validators';
import InfoTooltip from '@/components/ProductPageFlow/shared/InfoTooltip';
import MobileBirthDateCalendar from '@/components/ProductPageFlow/shared/MobileBirthDateCalendar';

interface PersonalInfoStepProps {
  branchConfig: OfflineBranchConfig;
  formik: FormikProps<OfflineFormData>;
  isLoading: boolean;
  error: string | null;
  kvkkConsent: boolean;
  marketingConsent: boolean;
  kvkkError: string | null;
  accessToken: string | null;
  onKvkkChange: (value: boolean) => void;
  onMarketingChange: (value: boolean) => void;
  onSubmit: () => void;
}

const PersonalInfoStep = ({
  branchConfig,
  formik,
  isLoading,
  error,
  kvkkConsent,
  marketingConsent,
  kvkkError,
  accessToken,
  onKvkkChange,
  onMarketingChange,
  onSubmit,
}: PersonalInfoStepProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const storageKeys = getStorageKeys(branchConfig.storageKeyPrefix);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const emailInput = (
    <div className={`pp-form-group ${formik.touched.email && formik.errors.email ? 'error' : ''}`}>
      <label className="pp-label">E-posta Adresi (İsteğe Bağlı)</label>
      <input
        type="email"
        className="pp-input"
        id="email"
        name="email"
        value={formik.values.email || ''}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder="ornek@eposta.com"
      />
      {formik.touched.email && formik.errors.email && (
        <div className="pp-error-message">{String(formik.errors.email)}</div>
      )}
    </div>
  );

  return (
    <div className="product-page-form">
      <div className="pp-card">
        <span className="pp-title">Kişisel Bilgiler</span>

        <div>
          <div className="pp-form-row">
            <div className={`pp-form-group ${formik.touched.identityNumber && formik.errors.identityNumber ? 'error' : ''}`}>
              <label className="pp-label">T.C. Kimlik Numarası / Vergi Kimlik Numarası</label>
              <input
                type="text"
                className="pp-input"
                id="identityNumber"
                name="identityNumber"
                value={formik.values.identityNumber || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  formik.setFieldValue('identityNumber', value);
                }}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  if (e.target.value) {
                    // 10 haneli ise VKN, 11 haneli ise TCKN
                    let validation;
                    if (e.target.value.length === 10) {
                      validation = validateTaxNumber(e.target.value);
                    } else {
                      validation = validateTCKNFull(e.target.value);
                    }
                    if (!validation.isValid) {
                      formik.setFieldError('identityNumber', validation.message);
                    }
                  }
                }}
                placeholder="___________"
                maxLength={11}
                minLength={10}
                disabled={!!accessToken}
              />
              {formik.touched.identityNumber && formik.errors.identityNumber && (
                <div className="pp-error-message">{String(formik.errors.identityNumber)}</div>
              )}
            </div>

            {!isMobile && emailInput}
          </div>

          <div className="pp-form-row">
            <div className={`pp-form-group ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'error' : ''}`}>
              <label className="pp-label">Cep Telefonu Numarası</label>
              <input
                type="tel"
                className="pp-input"
                id="phoneNumber"
                name="phoneNumber"
                value={formik.values.phoneNumber || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');

                  if (value.length === 0) {
                    formik.setFieldValue('phoneNumber', '');
                  } else if (value.length === 1) {
                    if (value[0] === '5') {
                      formik.setFieldValue('phoneNumber', value);
                    } else {
                      formik.setFieldValue('phoneNumber', '5');
                    }
                  } else if (value.length > 1) {
                    if (value[0] !== '5') {
                      formik.setFieldValue('phoneNumber', '5' + value.slice(1));
                    } else {
                      formik.setFieldValue('phoneNumber', value);
                    }
                  }
                }}
                onBlur={() => {
                  formik.setFieldTouched('phoneNumber', true);
                  formik.validateField('phoneNumber');
                }}
                placeholder="5__ ___ __ __"
                maxLength={10}
                disabled={!!accessToken}
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <div className="pp-error-message">{String(formik.errors.phoneNumber)}</div>
              )}
            </div>

            <div className={`pp-form-group ${formik.touched.birthDate && formik.errors.birthDate ? 'error' : ''}`}>
              <label className="pp-label">Doğum Tarihi</label>
              {isMobile ? (
                <MobileBirthDateCalendar
                  value={formik.values.birthDate || ''}
                  onChange={(val) => formik.setFieldValue('birthDate', val)}
                  onBlur={() => formik.setFieldTouched('birthDate', true)}
                  disabled={!!accessToken || (formik.values.identityNumber?.length === 10)}
                />
              ) : (
                <input
                  type="date"
                  className="pp-input"
                  id="birthDate"
                  name="birthDate"
                  value={formik.values.birthDate || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  disabled={!!accessToken || (formik.values.identityNumber?.length === 10)}
                  placeholder="__ / __ / ____"
                />
              )}
              {formik.touched.birthDate && formik.errors.birthDate && (
                <div className="pp-error-message">{String(formik.errors.birthDate)}</div>
              )}
            </div>
          </div>

          {isMobile && (
            <div className="pp-form-row">
              {emailInput}
            </div>
          )}

          {branchConfig.showJobField && (
            <div className="pp-form-row">
              <div className="pp-form-group">
                <label className="pp-label">
                  Meslek
                  <InfoTooltip
                    content="Mesleğinizi seçin, teklif adımında size özel fırsatları kaçırmayın."
                    className="pp-meslek-tooltip"
                  />
                </label>
                <Dropdown
                  id="job"
                  name="job"
                  value={formik.values.job || Job.Unknown}
                  options={JOB_OPTIONS}
                  onChange={(e: DropdownChangeEvent) => {
                    const value = parseInt(e.value);
                    formik.setFieldValue('job', value);
                    localStorage.setItem(storageKeys.INITIAL_JOB, value.toString());
                  }}
                  placeholder="Seçiniz"
                  className="pp-dropdown"
                  filter
                  filterPlaceholder="Ara..."
                  emptyFilterMessage="Sonuç bulunamadı"
                  showClear={false}
                />
              </div>
            </div>
          )}

          <div className="pp-toggles">
            <div className={`pp-toggle-item-wrapper ${kvkkError ? 'error' : ''}`}>
              <div className="pp-toggle-item">
                <div
                  className={`pp-toggle-switch ${kvkkConsent ? 'active' : ''}`}
                  onClick={() => onKvkkChange(!kvkkConsent)}
                >
                  <div className="pp-toggle-knob">{kvkkConsent ? '✓' : '✕'}</div>
                </div>
                <p className="pp-toggle-text">
                  Kişisel Verilerin İşlenmesine İlişkin <a href="/kvkk" target="_blank" rel="noopener noreferrer">Aydınlatma Metni</a> 'ni ve <a href="/acik-riza-metni" target="_blank" rel="noopener noreferrer">Açık Rıza Metni</a> 'ni okudum, onaylıyorum.
                </p>
              </div>
              {kvkkError && (
                <div className="pp-error-message">{kvkkError}</div>
              )}
            </div>

            <div className="pp-toggle-item">
              <div
                className={`pp-toggle-switch ${marketingConsent ? 'active' : ''}`}
                onClick={() => onMarketingChange(!marketingConsent)}
              >
                <div className="pp-toggle-knob">{marketingConsent ? '✓' : '✕'}</div>
              </div>
              <p className="pp-toggle-text">
                <a href="/elektronik-ileti-onayi" target="_blank" rel="noopener noreferrer">Ticari Elektronik İleti Metni</a> 'ni okudum, onaylıyorum.
              </p>
            </div>
          </div>

          {error && (
            <div className="pp-error-banner">
              {error}
            </div>
          )}

          <div className="pp-button-group">
            <button
              type="button"
              className="pp-btn-submit"
              onClick={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'İşleniyor...' : 'Devam Et'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;

