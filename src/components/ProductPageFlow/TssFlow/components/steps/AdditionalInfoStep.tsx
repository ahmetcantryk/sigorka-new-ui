/**
 * TSS Additional Info Step
 * 
 * Eksik profil bilgilerini tamamlamak için
 * Kasko AdditionalInfoStep ile aynı yapıda
 */

'use client';

import { useEffect, useState } from 'react';
import { AdditionalInfoStepProps } from '../../types';
import { CustomerType } from '@/utils/authHelper';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

const AdditionalInfoStep = ({
    formik,
    isLoading,
    cities,
    districts,
    error,
    onCityChange,
    onSubmit,
    fieldErrors,
}: AdditionalInfoStepProps) => {
    const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.Individual);

    useEffect(() => {
        // Mevcut profil bilgilerinden customerType'ı belirle
        const determineCustomerType = async () => {
            try {
                const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
                if (response.ok) {
                    const profile = await response.json();
                    const isCompany = (profile as any).taxNumber || (profile as any).type === 'company';
                    setCustomerType(isCompany ? CustomerType.Company : CustomerType.Individual);
                }
            } catch (error) {
                console.warn('Customer type belirlenemedi:', error);
            }
        };
        determineCustomerType();
    }, []);

    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Sadece harf ve boşluk, büyük harfe çevir
        let value = e.target.value;
        value = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').toUpperCase();
        formik.setFieldValue('fullName', value);
    };

    return (
        <div className="product-page-form">
            <div className="pp-card">
                <span className="pp-title">Eksik Bilgilerinizi Tamamlayın</span>
                <p className="pp-subtitle">
                    Tamamlayıcı Sağlık Sigortası teklifiniz için eksik bilgilerinizi doldurunuz.
                </p>

                <div>
                    {/* Ad Soyad / Şirket Ünvanı */}
                    <div className="pp-form-row">
                        <div className={`pp-form-group ${(formik.touched.fullName && formik.errors.fullName) || fieldErrors.fullName ? 'error' : ''}`}>
                            <label className="pp-label">
                                {customerType === CustomerType.Company ? 'Şirket Ünvanı' : 'Ad Soyad'}
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                className="pp-input"
                                placeholder={customerType === CustomerType.Company ? 'Şirket Ünvanı giriniz' : 'Ad Soyad giriniz'}
                                value={formik.values.fullName || ''}
                                onChange={handleFullNameChange}
                                onBlur={formik.handleBlur}
                                disabled={isLoading}
                            />
                            {((formik.touched.fullName && formik.errors.fullName) || fieldErrors.fullName) && (
                                <div className="pp-error-message">{formik.errors.fullName || fieldErrors.fullName}</div>
                            )}
                        </div>
                    </div>

                    {/* İl & İlçe */}
                    <div className="pp-form-row">
                        <div className={`pp-form-group ${(formik.touched.city && formik.errors.city) || fieldErrors.city ? 'error' : ''}`}>
                            <label className="pp-label">İl</label>
                            <select
                                name="city"
                                className="pp-input"
                                value={formik.values.city || ''}
                                onChange={(e) => {
                                    formik.setFieldValue('city', e.target.value);
                                    formik.setFieldValue('district', '');
                                    onCityChange(e.target.value);
                                }}
                                onBlur={formik.handleBlur}
                                disabled={isLoading}
                            >
                                <option value="">İl Seçiniz</option>
                                {cities.sort((a, b) => parseInt(a.value) - parseInt(b.value)).map((city) => (
                                    <option key={city.value} value={city.value}>
                                        {city.text}
                                    </option>
                                ))}
                            </select>
                            {((formik.touched.city && formik.errors.city) || fieldErrors.city) && (
                                <div className="pp-error-message">{formik.errors.city || fieldErrors.city}</div>
                            )}
                        </div>

                        <div className={`pp-form-group ${(formik.touched.district && formik.errors.district) || fieldErrors.district ? 'error' : ''}`}>
                            <label className="pp-label">İlçe</label>
                            <select
                                name="district"
                                className="pp-input"
                                value={formik.values.district || ''}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={isLoading || !formik.values.city || districts.length === 0}
                            >
                                <option value="">İlçe Seçiniz</option>
                                {districts.sort((a, b) => a.text.localeCompare(b.text, 'tr')).map((district) => (
                                    <option key={district.value} value={district.value}>
                                        {district.text}
                                    </option>
                                ))}
                            </select>
                            {((formik.touched.district && formik.errors.district) || fieldErrors.district) && (
                                <div className="pp-error-message">{formik.errors.district || fieldErrors.district}</div>
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

export default AdditionalInfoStep;
