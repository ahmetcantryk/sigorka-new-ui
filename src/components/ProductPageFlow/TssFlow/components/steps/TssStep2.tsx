/**
 * TSS Step 2 - Sağlık Bilgileri (Boy/Kilo)
 * Kasko VehicleSelectionStep yapısına benzer şekilde
 */

'use client';

import { useState } from 'react';
import { TssStep2Props } from '../../types';

const TssStep2 = ({
    formik,
    isLoading,
    onSubmit,
    onBack,
    error,
}: TssStep2Props) => {
    const [heightError, setHeightError] = useState<string | null>(null);
    const [weightError, setWeightError] = useState<string | null>(null);

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        formik.setFieldValue('height', value);
        
        // Validation
        if (value) {
            const height = parseInt(value);
            if (height < 50 || height > 250) {
                setHeightError('Boy 50-250 cm arasında olmalıdır');
            } else {
                setHeightError(null);
            }
        } else {
            setHeightError(null);
        }
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        formik.setFieldValue('weight', value);
        
        // Validation
        if (value) {
            const weight = parseInt(value);
            if (weight < 20 || weight > 300) {
                setWeightError('Kilo 20-300 kg arasında olmalıdır');
            } else {
                setWeightError(null);
            }
        } else {
            setWeightError(null);
        }
    };

    const isFormValid = () => {
        const height = parseInt(formik.values.height);
        const weight = parseInt(formik.values.weight);
        
        return (
            formik.values.height &&
            formik.values.weight &&
            height >= 50 && height <= 250 &&
            weight >= 20 && weight <= 300 &&
            !heightError &&
            !weightError
        );
    };

    return (
        <div className="product-page-form">
            <div className="pp-card">
                <span className="pp-title">Sağlık Bilgileri</span>
                <p className="pp-subtitle">Tamamlayıcı Sağlık Sigortası teklifiniz için boy ve kilo bilgilerinizi giriniz.</p>

                <div>
                    <div className="pp-form-row">
                        <div className={`pp-form-group ${(formik.touched.height && formik.errors.height) || heightError ? 'error' : ''}`}>
                            <label className="pp-label">Boy (cm)</label>
                            <input
                                type="text"
                                className="pp-input"
                                id="height"
                                name="height"
                                value={formik.values.height || ''}
                                onChange={handleHeightChange}
                                onBlur={formik.handleBlur}
                                placeholder="Örn: 175"
                                maxLength={3}
                                disabled={isLoading}
                            />
                            {((formik.touched.height && formik.errors.height) || heightError) && (
                                <div className="pp-error-message">{heightError || String(formik.errors.height)}</div>
                            )}
                        </div>

                        <div className={`pp-form-group ${(formik.touched.weight && formik.errors.weight) || weightError ? 'error' : ''}`}>
                            <label className="pp-label">Kilo (kg)</label>
                            <input
                                type="text"
                                className="pp-input"
                                id="weight"
                                name="weight"
                                value={formik.values.weight || ''}
                                onChange={handleWeightChange}
                                onBlur={formik.handleBlur}
                                placeholder="Örn: 70"
                                maxLength={3}
                                disabled={isLoading}
                            />
                            {((formik.touched.weight && formik.errors.weight) || weightError) && (
                                <div className="pp-error-message">{weightError || String(formik.errors.weight)}</div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="pp-error-banner">
                            {error}
                        </div>
                    )}

                    <div className="pp-button-group pp-button-group-spaced">
                     
                        <button
                            type="button"
                            className="pp-btn-submit"
                            onClick={(e) => {
                                e.preventDefault();
                                onSubmit();
                            }}
                            disabled={isLoading || !isFormValid()}
                        >
                            {isLoading ? 'Teklifler Hazırlanıyor...' : 'Teklifleri Gör'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TssStep2;
