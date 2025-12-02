

'use client';

import { FormikProps } from 'formik';
import { Dropdown } from 'primereact/dropdown';
import { KonutFormData } from '../../types';

interface AdditionalInfoStepProps {
    formik: FormikProps<KonutFormData>;
    cities: { value: string; text: string }[];
    districts: { value: string; text: string }[];
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
        <div className="pp-step-content">
            <h3 className="pp-step-title">Ek Bilgiler</h3>
            <p className="pp-step-description">
                Devam etmek için lütfen aşağıdaki bilgileri doldurunuz.
            </p>

            <div className="pp-form-row">
                <div className={`pp-form-group ${formik.touched.fullName && formik.errors.fullName ? 'error' : ''}`}>
                    <label className="pp-label">Ad Soyad *</label>
                    <input
                        type="text"
                        className="pp-input"
                        id="fullName"
                        name="fullName"
                        value={formik.values.fullName || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Ad Soyad"
                    />
                    {formik.touched.fullName && formik.errors.fullName && (
                        <div className="pp-error-message">{String(formik.errors.fullName)}</div>
                    )}
                </div>
            </div>

            <div className="pp-form-row">
                <div className={`pp-form-group ${formik.touched.city && formik.errors.city ? 'error' : ''}`}>
                    <label className="pp-label">İl *</label>
                    <Dropdown
                        value={formik.values.city}
                        options={cities.map(c => ({ label: c.text, value: c.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('city', e.value);
                            formik.setFieldValue('district', '');
                            onCityChange(e.value);
                        }}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        filter
                    />
                    {formik.touched.city && formik.errors.city && (
                        <div className="pp-error-message">{String(formik.errors.city)}</div>
                    )}
                </div>

                <div className={`pp-form-group ${formik.touched.district && formik.errors.district ? 'error' : ''}`}>
                    <label className="pp-label">İlçe *</label>
                    <Dropdown
                        value={formik.values.district}
                        options={[...districts].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(d => ({ label: d.text, value: d.value }))}
                        onChange={(e) => formik.setFieldValue('district', e.value)}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        filter
                        disabled={!formik.values.city}
                    />
                    {formik.touched.district && formik.errors.district && (
                        <div className="pp-error-message">{String(formik.errors.district)}</div>
                    )}
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
                    onClick={onSubmit}
                    disabled={isLoading || !formik.values.fullName || !formik.values.city || !formik.values.district}
                >
                    {isLoading ? 'İşleniyor...' : 'Devam Et'}
                </button>
            </div>
        </div>
    );
};

export default AdditionalInfoStep;

