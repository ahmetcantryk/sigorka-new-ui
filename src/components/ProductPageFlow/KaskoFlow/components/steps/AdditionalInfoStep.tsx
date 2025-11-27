/**
 * Kasko Flow - Eksik Bilgiler Step Bileşeni
 */

'use client';

import { FormikProps } from 'formik';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import type { VehicleFormData } from '../../types';

interface AdditionalInfoStepProps {
  formik: FormikProps<VehicleFormData>;
  cities: Array<{ value: string; text: string }>;
  districts: Array<{ value: string; text: string }>;
  isLoading: boolean;
  error: string | null;
  onCityChange: (cityValue: string) => void;
  onSubmit: () => void;
}

const AdditionalInfoStep = ({
  formik,
  cities,
  districts,
  isLoading,
  error,
  onCityChange,
  onSubmit,
}: AdditionalInfoStepProps) => {
  return (
    <div className="product-page-form">
      <div className="pp-card">
        <span className="pp-title">Eksik Bilgilerinizi Tamamlayın</span>
        <p className="pp-subtitle">
          Kasko Sigortası teklifiniz için eksik bilgilerinizi doldurunuz
        </p>

        <div>
          <div className="pp-form-row">
            <div className="pp-form-group">
              <label className="pp-label">Ad Soyad</label>
              <input
                type="text"
                className="pp-input"
                id="fullName"
                name="fullName"
                value={formik.values.fullName || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').toUpperCase();
                  formik.setFieldValue('fullName', value);
                }}
                onBlur={formik.handleBlur}
                placeholder="Adınız ve Soyadınız"
              />
            </div>
          </div>

          <div className="pp-form-row">
            <div className="pp-form-group">
              <label className="pp-label">İl</label>
              <Dropdown
                id="city"
                name="city"
                value={formik.values.city || ''}
                options={cities
                  .sort((a, b) => parseInt(a.value) - parseInt(b.value))
                  .map(city => ({
                    label: city.text,
                    value: city.value
                  }))}
                onChange={(e: DropdownChangeEvent) => {
                  const cityValue = e.value;
                  formik.setFieldValue('city', cityValue);
                  formik.setFieldValue('district', '');
                  onCityChange(cityValue);
                }}
                onBlur={() => formik.setFieldTouched('city', true)}
                placeholder="Seçiniz"
                className="pp-dropdown"
                filter
                filterPlaceholder="Ara..."
                emptyFilterMessage="Sonuç bulunamadı"
                showClear={false}
              />
            </div>

            <div className="pp-form-group">
              <label className="pp-label">İlçe</label>
              <Dropdown
                id="district"
                name="district"
                value={formik.values.district || ''}
                options={districts
                  .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
                  .map(district => ({
                    label: district.text,
                    value: district.value
                  }))}
                onChange={(e: DropdownChangeEvent) => formik.setFieldValue('district', e.value)}
                onBlur={() => formik.setFieldTouched('district', true)}
                placeholder="Seçiniz"
                className="pp-dropdown"
                filter
                filterPlaceholder="Ara..."
                emptyFilterMessage="Sonuç bulunamadı"
                disabled={!formik.values.city || districts.length === 0}
                showClear={false}
              />
            </div>
          </div>

          {error && (
            <div className="pp-error-banner">
              {error}
            </div>
          )}

          <button
            type="button"
            className="pp-btn-submit"
            onClick={onSubmit}
            disabled={isLoading || !formik.values.fullName || !formik.values.city || !formik.values.district}
          >
            {isLoading ? 'Kaydediliyor...' : 'Devam Et'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoStep;

