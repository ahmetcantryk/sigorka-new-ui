/**
 * IMM Step 1 - Kişisel Bilgiler
 * TSS PersonalInfoStep ile aynı yapıda (meslek yok)
 */

'use client';

import { useState, useEffect } from 'react';
import { validateTCKNFull, validateTaxNumber } from '@/utils/validators';
import MobileBirthDateCalendar from '@/components/ProductPageFlow/shared/MobileBirthDateCalendar';

interface ImmPersonalInfoStepProps {
    formik: any;
    isLoading: boolean;
    kvkkConsent: boolean;
    marketingConsent: boolean;
    kvkkError: string | null;
    onKvkkChange: (value: boolean) => void;
    onMarketingChange: (value: boolean) => void;
    onSubmit: () => void;
    accessToken: string | null;
    error: string | null;
}

const ImmPersonalInfoStep = ({
    formik,
    isLoading,
    kvkkConsent,
    marketingConsent,
    kvkkError,
    onKvkkChange,
    onMarketingChange,
    onSubmit,
    accessToken,
    error,
}: ImmPersonalInfoStepProps) => {
    const [isMobile, setIsMobile] = useState(false);

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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    };

    const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        formik.setFieldValue('identityNumber', value);
    };

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
                disabled={isLoading}
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
                                onChange={handleIdentityChange}
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
                                disabled={!!accessToken || isLoading}
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
                                onChange={handlePhoneChange}
                                onBlur={() => {
                                    formik.setFieldTouched('phoneNumber', true);
                                    formik.validateField('phoneNumber');
                                }}
                                placeholder="5__ ___ __ __"
                                maxLength={10}
                                disabled={!!accessToken || isLoading}
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
                                    disabled={!!accessToken || isLoading || (formik.values.identityNumber?.length === 10)}
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
                                    disabled={!!accessToken || isLoading || (formik.values.identityNumber?.length === 10)}
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

                    <div className="pp-toggles">
                        <div className={`pp-toggle-item-wrapper ${kvkkError ? 'error' : ''}`}>
                            <div className="pp-toggle-item">
                                <div
                                    className={`pp-toggle-switch ${kvkkConsent ? 'active' : ''}`}
                                    onClick={() => !isLoading && onKvkkChange(!kvkkConsent)}
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
                                onClick={() => !isLoading && onMarketingChange(!marketingConsent)}
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
                            {isLoading ? 'İşleniyor...' : 'Araç Bilgilerine Geç'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImmPersonalInfoStep;

