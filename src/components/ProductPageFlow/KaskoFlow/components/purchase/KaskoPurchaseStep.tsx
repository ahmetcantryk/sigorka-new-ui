/**
 * Kasko Purchase Step
 * 
 * Kasko sigortası satın alma adımı
 * ProductPageFlow tasarımına uygun
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { useRouter } from 'next/navigation';
import { createSessionViaAPI } from '@/services/paratika';
import { customerApi } from '@/services/api';
import SimpleIframe3D from '@/components/PaymentFlow/SimpleIframe3D';
import {
    validateCardNumber,
    validateCardHolder,
    validateExpiryDate,
    validateCvv,
    validateCardHolderIdentityNumber,
} from '@/utils/validators';
import { pushKaskoPaymentSuccess, pushKaskoPaymentFailed } from '../../utils/dataLayerUtils';
import DocumentErrorModal from '@/components/common/DocumentErrorModal';
import { isIOS, createPlaceholderWindow, fetchAndOpenPdf } from '../../../shared/utils/pdfUtils';

interface PremiumData {
    installmentNumber: number;
    netPremium: number;
    grossPremium: number;
    commission: number;
    exchangeRate: number;
    currency: string;
    insuranceCompanyProposalNumber: string;
    formattedNetPremium?: string;
    formattedGrossPremium?: string;
}

interface InsuranceCompany {
    id: number;
    name: string;
    proposalProductId: string;
}

interface SelectedQuoteData {
    id: string;
    company?: string;
    coverage?: number;
    features?: string[];
    premiums: PremiumData[];
    selectedInstallmentNumber: number;
    insuranceCompanyId?: number;
    insuranceCompany?: InsuranceCompany;
    productId: string;
    proposalProductId: string;
    proposalId: string;
    insuranceCompanyLogo?: string;
    coverageGroupName?: string;
    hasUndamagedDiscount?: boolean;
    hasUndamagedDiscountRate?: number;
}

interface KaskoPurchaseStepProps {
    onNext: () => void;
    onBack?: () => void;
}

export default function KaskoPurchaseStep({ onNext, onBack }: KaskoPurchaseStepProps) {
    const router = useRouter();
    const token = useAuthStore((state) => state.accessToken);
    const [selectedQuoteData, setSelectedQuoteData] = useState<SelectedQuoteData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSendingPreInfoForm, setIsSendingPreInfoForm] = useState(false);
    const [offerDetailsAccepted, setOfferDetailsAccepted] = useState(false);
    const [preInfoFormAccepted, setPreInfoFormAccepted] = useState(false);
    const [showDocumentErrorModal, setShowDocumentErrorModal] = useState(false);
    const [currentPremium, setCurrentPremium] = useState<PremiumData | null | undefined>(null);

    // Başarılı/Başarısız ekran state'leri
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [showErrorScreen, setShowErrorScreen] = useState(false);
    const [policyId, setPolicyId] = useState<string>('');

    // Kredi kartı bilgileri
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    // Kart sahibi TCKN kontrolü için state'ler
    const [isCardHolderSameAsInsured, setIsCardHolderSameAsInsured] = useState(true);
    const [cardHolderTckn, setCardHolderTckn] = useState('');

    // Validation states
    const [formErrors, setFormErrors] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        cardHolderTckn: '',
    });
    const [isFormValid, setIsFormValid] = useState(false);

    // Canvas 3D Payment state'leri
    const [showCanvas, setShowCanvas] = useState(false);
    const [canvasHtmlContent, setCanvasHtmlContent] = useState<string>('');

    useEffect(() => {
        const fetchQuoteDetails = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const proposalIdFromUrl = urlParams.get('proposalId') || urlParams.get('proposalid');
                const productIdFromUrl = urlParams.get('purchaseId') || urlParams.get('purchaseid') ||
                    urlParams.get('productId') || urlParams.get('productid');

                const proposalId = proposalIdFromUrl || localStorage.getItem('currentProposalId') || localStorage.getItem('proposalIdForKasko');
                const productId = productIdFromUrl || localStorage.getItem('selectedProductIdForKasko');

                if (!proposalId) {
                    setErrorMessage('Teklif ID bulunamadı. Lütfen önceki sayfaya dönüp tekrar deneyin.');
                    return;
                }

                if (!productId) {
                    setErrorMessage('Ürün ID bulunamadı. Lütfen önceki sayfaya dönüp tekrar deneyin.');
                    return;
                }

                const response = await fetchWithAuth(`${API_BASE_URL}/api/proposals/${proposalId}`);

                // 401 Unauthorized - oturum süresi dolmuş
                if (response.status === 401) {
                    console.log('⚠️ 401 Unauthorized - Oturum süresi dolmuş, form sayfasına yönlendiriliyor...');
                    window.location.href = '/kasko-sigortasi';
                    return;
                }

                if (!response.ok) {
                    throw new Error('Teklif bilgileri alınamadı');
                }

                const proposalData = await response.json();
                const selectedProduct = proposalData.products?.find((p: any) => p.id === productId);

                if (selectedProduct) {
                    // Önce localStorage'dan seçilen taksit bilgisini kontrol et
                    const storedQuote = localStorage.getItem('selectedQuoteForPurchase');
                    let selectedInstallment = selectedProduct.premiums?.[0]?.installmentNumber || 1;
                    
                    if (storedQuote) {
                        try {
                            const parsedStoredQuote = JSON.parse(storedQuote);
                            // Aynı quote için kayıtlı taksit bilgisi varsa onu kullan
                            if (parsedStoredQuote.id === selectedProduct.id && parsedStoredQuote.selectedInstallmentNumber) {
                                selectedInstallment = parsedStoredQuote.selectedInstallmentNumber;
                            }
                        } catch (e) {
                            // Parse hatası durumunda varsayılan değeri kullan
                        }
                    }

                    const quoteData: SelectedQuoteData = {
                        id: selectedProduct.id,
                        company: selectedProduct.insuranceCompanyName,
                        insuranceCompanyId: selectedProduct.insuranceCompanyId,
                        productId: selectedProduct.productId,
                        premiums: selectedProduct.premiums,
                        selectedInstallmentNumber: selectedInstallment,
                        proposalProductId: selectedProduct.id,
                        proposalId: proposalId,
                        insuranceCompany: {
                            id: selectedProduct.insuranceCompanyId,
                            name: selectedProduct.insuranceCompanyName,
                            proposalProductId: selectedProduct.id,
                        },
                        insuranceCompanyLogo: selectedProduct.insuranceCompanyLogo || `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${selectedProduct.insuranceCompanyId}.png`,
                        coverageGroupName: selectedProduct.coverageGroupName,
                        hasUndamagedDiscount: selectedProduct.hasUndamagedDiscount,
                        hasUndamagedDiscountRate: selectedProduct.hasUndamagedDiscountRate,
                    };

                    setSelectedQuoteData(quoteData);
                    localStorage.setItem('selectedQuoteForPurchase', JSON.stringify(quoteData));
                    localStorage.setItem('currentProposalId', proposalId);
                    localStorage.setItem('selectedProductIdForKasko', productId);
                } else {
                    const storedQuote = localStorage.getItem('selectedQuoteForPurchase');
                    if (storedQuote) {
                        const parsedQuote = JSON.parse(storedQuote) as SelectedQuoteData;
                        setSelectedQuoteData(parsedQuote);
                    } else {
                        setErrorMessage('Seçili teklif bulunamadı. Lütfen önceki sayfaya dönüp tekrar deneyin.');
                    }
                }
            } catch (error) {
                const storedQuote = localStorage.getItem('selectedQuoteForPurchase');
                if (storedQuote) {
                    try {
                        const parsedQuote = JSON.parse(storedQuote) as SelectedQuoteData;
                        setSelectedQuoteData(parsedQuote);
                    } catch (parseError) {
                        setErrorMessage('Seçili teklif bilgisi alınamadı. Lütfen tekrar deneyin.');
                    }
                } else {
                    setErrorMessage('Seçili teklif bulunamadı. Lütfen önceki sayfaya dönüp tekrar deneyin.');
                }
            }
        };

        fetchQuoteDetails();
    }, [token]);

    useEffect(() => {
        if (selectedQuoteData) {
            const premiumDetails = getCurrentPremiumDetails();
            setCurrentPremium(premiumDetails);
        }
    }, [selectedQuoteData]);

    useEffect(() => {
        const validateForm = () => {
            const isCardNumberValid = validateCardNumber(cardNumber.replace(/\s/g, '')).isValid;
            const isCardHolderValid = validateCardHolder(cardHolder).isValid;
            const isExpiryDateValid = validateExpiryDate(expiryDate).isValid;
            const isCvvValid = validateCvv(cvv).isValid;
            const isTcknValid = isCardHolderSameAsInsured || validateCardHolderIdentityNumber(cardHolderTckn).isValid;
            const allCheckboxesAccepted = offerDetailsAccepted && preInfoFormAccepted;

            setIsFormValid(isCardNumberValid && isCardHolderValid && isExpiryDateValid && isCvvValid && isTcknValid && allCheckboxesAccepted);
        };

        validateForm();
    }, [cardNumber, cardHolder, expiryDate, cvv, cardHolderTckn, isCardHolderSameAsInsured, offerDetailsAccepted, preInfoFormAccepted]);

    // 3D doğrulama sonuçlarını kontrol et
    useEffect(() => {
        const check3DResult = () => {
            const result1 = localStorage.getItem('paratika3dResult');
            const result2 = localStorage.getItem('paratika_3d_result');
            const status = localStorage.getItem('paratika_3d_status');
            const error = localStorage.getItem('paratika_3d_error');

            let parsedResult = null;

            if (result1) {
                try {
                    parsedResult = JSON.parse(result1);
                    localStorage.removeItem('paratika3dResult');
                } catch (e) { }
            }

            if (result2 || status === 'error' || error) {
                if (status === 'error' || error) {
                    localStorage.removeItem('paratika_3d_result');
                    localStorage.removeItem('paratika_3d_error');
                    localStorage.removeItem('paratika_3d_status');
                    localStorage.removeItem('paratika3dHtmlContent');
                    localStorage.removeItem('paratika_merchantPaymentId');
                    localStorage.removeItem('paratikaSessionToken');
                    localStorage.removeItem('paratika_3d_url');
                    localStorage.removeItem('paratika_3d_params');
                    setErrorMessage('Kart doğrulaması başarısız oldu. Lütfen kart bilgilerinizi kontrol edip işlemi tekrar deneyin.');
                    return;
                }

                if (result2) {
                    try {
                        const parsed = JSON.parse(result2);
                        if (parsed.success) {
                            localStorage.removeItem('paratika_3d_result');
                            router.push('/odeme/paratika-callback?type=kasko&action=validate');
                            return;
                        }
                    } catch (e) { }
                }
            }

            if (parsedResult) {
                if (parsedResult.success) {
                    router.push('/odeme/paratika-callback?type=kasko&action=validate');
                } else {
                    localStorage.removeItem('paratika_3d_result');
                    localStorage.removeItem('paratika_3d_error');
                    localStorage.removeItem('paratika_3d_status');
                    localStorage.removeItem('paratika3dHtmlContent');
                    localStorage.removeItem('paratika_merchantPaymentId');
                    localStorage.removeItem('paratikaSessionToken');
                    localStorage.removeItem('paratika_3d_url');
                    localStorage.removeItem('paratika_3d_params');
                    setErrorMessage(parsedResult.message || '3D doğrulama başarısız');
                }
            }
        };

        window.addEventListener('focus', check3DResult);
        return () => {
            window.removeEventListener('focus', check3DResult);
        };
    }, [router]);

    const getCurrentPremiumDetails = (): PremiumData | null | undefined => {
        if (!selectedQuoteData) return null;
        return selectedQuoteData.premiums.find(
            (p) => p.installmentNumber === selectedQuoteData.selectedInstallmentNumber
        );
    };

    const cleanupLocalStorage = () => {
        localStorage.removeItem('paratika_3d_result');
        localStorage.removeItem('paratika_3d_status');
        localStorage.removeItem('paratika_3d_error');
        localStorage.removeItem('paratika3dHtmlContent');
        localStorage.removeItem('paratika_merchantPaymentId');
        localStorage.removeItem('paratikaSessionToken');
        localStorage.removeItem('paratika_3d_url');
        localStorage.removeItem('paratika_3d_params');
        localStorage.removeItem('pendingPaymentData');
        localStorage.removeItem('purchaseReturnUrl');
        localStorage.removeItem('paratika_purchase_status');
        localStorage.removeItem('paratika_purchase_result');
        localStorage.removeItem('paratika_purchase_error');
        localStorage.removeItem('current_order_data');
        localStorage.removeItem('proposalIdForKasko');
        localStorage.removeItem('currentProposalId');
        localStorage.removeItem('selectedQuoteInfo');
        localStorage.removeItem('kaskoQuoteFlow');
        localStorage.removeItem('selectedProductId');
        localStorage.removeItem('paymentAmount');
        localStorage.removeItem('paymentBranch');
        localStorage.removeItem('selectedInstallmentNumber');
    };

    const handlePayment = async () => {
        if (!selectedQuoteData || !currentPremium) {
            setErrorMessage('Ödeme için gerekli teklif veya prim bilgileri eksik.');
            return;
        }
        if (!offerDetailsAccepted || !preInfoFormAccepted) {
            setErrorMessage('Lütfen bilgilendirme formlarını onaylayın.');
            return;
        }
        if (!token) {
            setErrorMessage('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
            setIsProcessing(false);
            return;
        }

        localStorage.setItem('purchaseReturnUrl', window.location.href);

        setIsProcessing(true);
        setErrorMessage(null);

        let proposalIdFromStorage = localStorage.getItem('proposalIdForKasko');
        if (!proposalIdFromStorage) {
            proposalIdFromStorage = selectedQuoteData.proposalId;
        }

        if (!proposalIdFromStorage) {
            try {
                const selectedQuoteForPurchase = localStorage.getItem('selectedQuoteForPurchase');
                if (selectedQuoteForPurchase) {
                    const purchaseData = JSON.parse(selectedQuoteForPurchase);
                    if (purchaseData && purchaseData.proposalId) {
                        proposalIdFromStorage = purchaseData.proposalId;
                    }
                }
            } catch (error) { }
        }

        if (!proposalIdFromStorage) {
            const currentUrl = window.location.pathname;
            const purchaseMatch = currentUrl.match(/\/purchase\/([^\/]+)/);
            if (purchaseMatch && purchaseMatch[1]) {
                proposalIdFromStorage = purchaseMatch[1];
            }
        }

        if (!proposalIdFromStorage) {
            setErrorMessage("Ana Teklif ID (proposalId) bulunamadı, ödeme yapılamıyor.");
            setIsProcessing(false);
            return;
        }

        const proposalProductApiId = selectedQuoteData.id;
        if (!proposalProductApiId) {
            setErrorMessage("Detaylı Ürün ID (selectedQuoteData.id) bulunamadı. Seçili teklif verisi eksik.");
            setIsProcessing(false);
            return;
        }

        try {
            const customerProfile = await customerApi.getProfile();
            const clientIP = '127.0.0.1';
            const userAgent = navigator.userAgent;
            const merchantPaymentId = `KASKO-${proposalIdFromStorage}-${Date.now()}`;

            const sessionData = {
                amount: currentPremium.grossPremium,
                orderId: merchantPaymentId,
                customerInfo: {
                    id: customerProfile.id,
                    name: customerProfile.fullName,
                    email: customerProfile.primaryEmail,
                    phone: customerProfile.primaryPhoneNumber.number,
                    ip: clientIP,
                    userAgent: userAgent,
                },
                billingAddress: {
                    addressLine: customerProfile.city?.text || 'İstanbul',
                    city: customerProfile.city?.text || 'İstanbul',
                    postalCode: '34000',
                },
                shippingAddress: {
                    addressLine: customerProfile.city?.text || 'İstanbul',
                    city: customerProfile.city?.text || 'İstanbul',
                    postalCode: '34000',
                },
                orderItems: [
                    {
                        productCode: proposalProductApiId,
                        name: 'Kasko Sigortası',
                        description: `${proposalIdFromStorage} numaralı kasko sigorta teklifi`,
                        quantity: 1,
                        amount: currentPremium.grossPremium,
                    },
                ],
            };

            const sessionResponse = await createSessionViaAPI(sessionData);

            if (sessionResponse.responseCode !== '00') {
                setIsProcessing(false);
                setShowErrorScreen(true);
                return;
            }

            const expiryParts = expiryDate.split('/');

            localStorage.setItem('pendingPaymentData', JSON.stringify({
                type: 'kasko',
                proposalId: proposalIdFromStorage,
                proposalProductId: proposalProductApiId,
                installmentNumber: currentPremium.installmentNumber,
                merchantPaymentId: merchantPaymentId,
                sessionToken: sessionResponse.sessionToken,
                timestamp: Date.now()
            }));

            const cardData = {
                sessionToken: sessionResponse.sessionToken,
                cardInfo: {
                    cardNumber: cardNumber.replace(/\s/g, ''),
                    cardHolder: cardHolder,
                    expiryMonth: expiryParts[0].padStart(2, '0'),
                    expiryYear: parseInt(expiryParts[1], 10),
                    cvv: cvv,
                }
            };

            const threeDResponse = await fetch('/api/paratika/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cardData)
            });

            if (!threeDResponse.ok) {
                const errorData = await threeDResponse.json();
                throw new Error(errorData.error || '3D doğrulama başlatılamadı');
            }

            const threeDResult = await threeDResponse.json();

            if (!threeDResult.success || !threeDResult.html) {
                throw new Error('3D doğrulama sayfası alınamadı');
            }

            if (!threeDResult.html || threeDResult.html.trim() === '') {
                throw new Error('3D HTML içeriği boş! Banka sayfası oluşturulamadı.');
            }

            setCanvasHtmlContent(threeDResult.html);
            setShowCanvas(true);
            setErrorMessage('3D güvenlik doğrulaması açıldı. SMS kodunu girin.');

        } catch (error: any) {
            setErrorMessage(error.message || 'Ödeme işlemi başlatılamadı');
            setIsProcessing(false);
            setShowErrorScreen(true);
        }
    };

    const proceedWithPurchase = async (threeDResult: any) => {
        try {
            setShowCanvas(false);
            setCanvasHtmlContent('');
            setErrorMessage('Satın alma işleminiz devam ediyor...');

            if (!selectedQuoteData || !currentPremium) {
                throw new Error('Seçili teklif veya prim bilgisi bulunamadı');
            }

            const expiryParts = expiryDate.split('/');
            const proposalId = localStorage.getItem('currentProposalId');
            const customerProfile = await customerApi.getProfile();
            const identityNumber = isCardHolderSameAsInsured
                ? customerProfile.identityNumber.toString()
                : cardHolderTckn;

            const purchaseData = {
                proposalId: proposalId,
                proposalProductId: selectedQuoteData.id,
                installmentNumber: currentPremium.installmentNumber,
                card: {
                    identityNumber: identityNumber,
                    number: cardNumber.replace(/\s/g, ''),
                    cvc: cvv,
                    expiryMonth: expiryParts[0].padStart(2, '0'),
                    expiryYear: expiryParts[1].padStart(2, '0'),
                    holderName: cardHolder
                }
            };

            if (!purchaseData.proposalId || !purchaseData.proposalProductId) {
                throw new Error('Teklif ID bilgileri eksik. Lütfen sayfayı yenileyin.');
            }

            const response = await fetchWithAuth(
                API_ENDPOINTS.PROPOSAL_PRODUCT_PURCHASE_SYNC(purchaseData.proposalId, purchaseData.proposalProductId),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        $type: 'credit-card',
                        ...purchaseData
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Satın alma işlemi başarısız');
            }

            const result = await response.json();
            cleanupLocalStorage();

            setPolicyId(result.policyId || '');
            setShowSuccessScreen(true);
            setIsProcessing(false);
            
            // Ödeme başarılı dataLayer push
            pushKaskoPaymentSuccess();

        } catch (error: any) {
            setErrorMessage(`Satın alma başarısız: ${error.message}`);
            setIsProcessing(false);
            cleanupLocalStorage();
            setShowErrorScreen(true);
            
            // Ödeme başarısız dataLayer push
            pushKaskoPaymentFailed(error.message);
        }
    };

    const handleViewPreInfoForm = async () => {
        if (!selectedQuoteData) {
            setErrorMessage('Teklif bilgisi bulunamadı.');
            return;
        }
        const proposalId = localStorage.getItem('currentProposalId');
        const proposalProductId = selectedQuoteData.id;

        if (!proposalId || !proposalProductId) {
            setErrorMessage('Ön bilgilendirme formu için gerekli ID bilgileri eksik.');
            return;
        }

        setIsSendingPreInfoForm(true);
        setErrorMessage(null);

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.PROPOSAL_PREINFO_FORM(proposalId, proposalProductId), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!(response as any).ok) {
                throw new Error('Ön bilgilendirme formu görüntülenemedi');
            }
            const data = await (response as any).json();
            if (data.url) {
                window.open(data.url, '_blank');
            } else {
                throw new Error("Döküman URL'si bulunamadı");
            }
        } catch (error) {
            setShowDocumentErrorModal(true);
        } finally {
            setIsSendingPreInfoForm(false);
        }
    };

    const handleViewOfferDocument = async () => {
        if (!selectedQuoteData || !token) {
            setErrorMessage('Teklif bilgisi veya oturum bilgisi bulunamadı.');
            return;
        }
        
        const proposalId = localStorage.getItem('currentProposalId') || selectedQuoteData.proposalId;
        const proposalProductId = selectedQuoteData.id;

        if (!proposalId || !proposalProductId) {
            setErrorMessage('Teklif belgesi için gerekli ID bilgileri eksik.');
            return;
        }

        // iOS için popup blocker'ı aşmak için kullanıcı etkileşimi sırasında window aç
        const placeholderWindow = isIOS() ? createPlaceholderWindow() : null;

        try {
            const response = await fetchWithAuth(
                API_ENDPOINTS.PROPOSAL_PRODUCT_DOCUMENT(proposalId, proposalProductId),
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error('Döküman görüntülenirken bir hata oluştu');
            }

            const data = await response.json();
            if (data.url) {
                await fetchAndOpenPdf(data.url, placeholderWindow);
            }
        } catch (error) {
            console.error('Document view error:', error);
            // Hata durumunda placeholder window'u kapat
            if (placeholderWindow && !placeholderWindow.closed) {
                placeholderWindow.close();
            }
            setShowDocumentErrorModal(true);
        }
    };

    // Kart sahibi sigortalı ile aynı ise fullName'i otomatik doldur
    useEffect(() => {
        const fetchCustomerName = async () => {
            if (isCardHolderSameAsInsured) {
                try {
                    const customerProfile = await customerApi.getProfile();
                    if (customerProfile?.fullName) {
                        setCardHolder(customerProfile.fullName.toUpperCase());
                        setFormErrors(prev => ({ ...prev, cardHolder: '' }));
                    }
                } catch (error) {
                    console.error('Error fetching customer profile:', error);
                }
            } else {
                // Kart sahibi farklı ise input'u temizle
                setCardHolder('');
                setFormErrors(prev => ({ ...prev, cardHolder: '' }));
            }
        };

        fetchCustomerName();
    }, [isCardHolderSameAsInsured]);

    useEffect(() => {
        return () => {
            if (showCanvas) {
                setShowCanvas(false);
                setCanvasHtmlContent('');
            }
        };
    }, []);

    // Başarılı Ekran
    const renderSuccessScreen = () => (
        <div className="product-page-flow-container">
            <div className="product-page-form pp-form-wide">
                <div className="pp-card">
                    <div className="pp-quote-error-container">
                        <img src="/images/product-detail/success-tick.svg" alt="Satın Alma Başarılı" className="pp-success-image" />
                        <span className="pp-success-card-title">Satın Alma Başarılı</span>
                        <span className="pp-error-card-subtitle">Kasko Sigortası poliçeniz başarıyla oluşturuldu</span>
                        <p className="pp-success-message-card-desc">
                            Poliçe detaylarını Hesabım menüsünden görüntüleyebilir, poliçe belgelerinizi indirebilirsiniz
                        </p>
                        <button
                            className="pp-btn-submit"
                            onClick={() => router.push('/dashboard/policies')}
                        >
                            Poliçelerimi Görüntüle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Başarısız Ekran
    const renderErrorScreen = () => (
        <div className="product-page-flow-container">
            <div className="product-page-form pp-form-wide">
                <div className="pp-card">
                    <div className="pp-quote-error-container">
                        <img src="/images/product-detail/error-x.svg" alt="Satın Alma Başarısız" className="pp-error-image" />
                        <span className="pp-error-card-title">Satın Alma Başarısız</span>
                        <span className="pp-error-card-subtitle">Kasko Sigortası satın alma işlemi tamamlanamadı.</span>
                        <p className="pp-error-message-card-desc">
                            Lütfen bilgilerinizi kontrol ederek tekrar deneyiniz. Sorun devam ederse müşteri hizmetlerimizle iletişime geçebilirsiniz.
                        </p>
                        <div className="pp-error-buttons">
                            {onBack && (
                                <button className="pp-btn-purchase-back" onClick={onBack}>
                                    Tekliflere Geri Dön
                                </button>
                            )}
                            <button
                                className="pp-btn-submit"
                                onClick={() => {
                                    setShowErrorScreen(false);
                                    setIsProcessing(false);
                                    setErrorMessage(null);
                                }}
                            >
                                Ödeme Adımına Geri Dön
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (showSuccessScreen) {
        return renderSuccessScreen();
    }

    if (showErrorScreen) {
        return renderErrorScreen();
    }

    return (
        <>
            <div className="pp-payment-container">
                {/* Sol Taraf - Kredi Kartı Bilgileri */}
                <div className="pp-card pp-payment-card">
                    <h2 className="pp-card-title">Kredi Kartı Bilgileri</h2>
                    <p className="pp-payment-subtitle">
                        Güvenli ödeme için kredi kartı bilgilerinizi girin. Ödeme 3D güvenli altyapı ile gerçekleştirilecektir.
                    </p>

                    {/* Kart Sahibi Sigortalı ile Aynı mı */}
                    <div className="pp-radio-section">
                        <div className="pp-radio-header">
                            <label className="pp-radio-label-text">Kart sahibi sigortalı ile aynı</label>
                            <div className="pp-radio-group">
                                <label className="pp-radio-label">
                                    <input
                                        type="radio"
                                        name="cardOwnerSame"
                                        checked={isCardHolderSameAsInsured}
                                        onChange={() => {
                                            setIsCardHolderSameAsInsured(true);
                                            setCardHolderTckn('');
                                            setFormErrors(prev => ({ ...prev, cardHolderTckn: '' }));
                                        }}
                                    />
                                    <span>Evet</span>
                                </label>
                                <label className="pp-radio-label">
                                    <input
                                        type="radio"
                                        name="cardOwnerSame"
                                        checked={!isCardHolderSameAsInsured}
                                        onChange={() => {
                                            setIsCardHolderSameAsInsured(false);
                                            setCardHolder('');
                                            setFormErrors(prev => ({ ...prev, cardHolder: '' }));
                                        }}
                                    />
                                    <span>Hayır</span>
                                </label>
                            </div>
                        </div>

                        {/* TCKN Input */}
                        {!isCardHolderSameAsInsured && (
                            <div className={`pp-form-group ${formErrors.cardHolderTckn ? 'error' : ''}`}>
                                <input
                                    type="text"
                                    className="pp-input"
                                    placeholder="Kart Sahibi TCKN (11 hane)"
                                    value={cardHolderTckn}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 11) {
                                            setCardHolderTckn(value);
                                            const validation = validateCardHolderIdentityNumber(value);
                                            setFormErrors(prev => ({ ...prev, cardHolderTckn: validation.isValid ? '' : (validation.message || '') }));
                                        }
                                    }}
                                    maxLength={11}
                                />
                                {formErrors.cardHolderTckn && (
                                    <span className="pp-error-message">{formErrors.cardHolderTckn}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* İsim Soyisim */}
                    <div className={`pp-form-group pp-form-group-mb ${formErrors.cardHolder ? 'error' : ''}`}>
                        <input
                            type="text"
                            className="pp-input pp-input-uppercase"
                            placeholder="Ad Soyad"
                            value={cardHolder}
                            onChange={(e) => {
                                const filteredValue = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
                                const upperValue = filteredValue.toLocaleUpperCase('tr-TR');
                                setCardHolder(upperValue);
                                const validation = validateCardHolder(upperValue);
                                setFormErrors(prev => ({ ...prev, cardHolder: validation.isValid ? '' : (validation.message || '') }));
                            }}
                        />
                        {formErrors.cardHolder && (
                            <span className="pp-error-message">{formErrors.cardHolder}</span>
                        )}
                    </div>

                    {/* Kart Numarası */}
                    <div className={`pp-form-group pp-form-group-mb ${formErrors.cardNumber ? 'error' : ''}`}>
                        <input
                            type="text"
                            className="pp-input"
                            placeholder="Kart Numarası"
                            value={cardNumber}
                            onChange={(e) => {
                                const rawValue = e.target.value;
                                const hasNonDigit = /[^\d\s]/.test(rawValue);
                                const digitsOnly = rawValue.replace(/\D/g, '');
                                const truncatedDigits = digitsOnly.slice(0, 16);
                                const formattedValue = truncatedDigits.replace(/(.{4})/g, '$1 ').trim();
                                setCardNumber(formattedValue);
                                if (hasNonDigit) {
                                    setFormErrors(prev => ({ ...prev, cardNumber: 'Yalnızca rakamlardan oluşmalıdır.' }));
                                } else {
                                    const validation = validateCardNumber(truncatedDigits);
                                    setFormErrors(prev => ({ ...prev, cardNumber: validation.isValid ? '' : (validation.message || '') }));
                                }
                            }}
                            maxLength={19}
                        />
                        {formErrors.cardNumber && (
                            <span className="pp-error-message">{formErrors.cardNumber}</span>
                        )}
                    </div>

                    {/* Ay/Yıl ve CVC/CVV */}
                    <div className="pp-form-row pp-form-group-mb">
                        <div className={`pp-form-group ${formErrors.expiryDate ? 'error' : ''}`}>
                            <input
                                type="text"
                                className="pp-input"
                                placeholder="Ay / Yıl"
                                value={expiryDate}
                                onChange={(e) => {
                                    const rawValue = e.target.value;
                                    const hasNonDigit = /[^\d/]/.test(rawValue);
                                    let value = rawValue.replace(/\D/g, '');
                                    if (value.length > 0 && !['0', '1'].includes(value[0])) {
                                        value = '';
                                    }
                                    if (value.length > 1) {
                                        const month = parseInt(value.substring(0, 2), 10);
                                        if (month > 12) {
                                            value = value[0];
                                        }
                                    }
                                    if (value.length > 2) {
                                        value = value.slice(0, 2) + '/' + value.slice(2);
                                    }
                                    setExpiryDate(value.slice(0, 5));
                                    if (hasNonDigit) {
                                        setFormErrors(prev => ({ ...prev, expiryDate: 'Yalnızca rakamlardan oluşmalıdır.' }));
                                    } else {
                                        const validation = validateExpiryDate(value);
                                        setFormErrors(prev => ({ ...prev, expiryDate: validation.isValid ? '' : (validation.message || '') }));
                                    }
                                }}
                                maxLength={5}
                            />
                            {formErrors.expiryDate && (
                                <span className="pp-error-message">{formErrors.expiryDate}</span>
                            )}
                        </div>

                        <div className={`pp-form-group ${formErrors.cvv ? 'error' : ''}`}>
                            <input
                                type="text"
                                className="pp-input"
                                placeholder="CVC / CVV"
                                value={cvv}
                                onChange={(e) => {
                                    const rawValue = e.target.value;
                                    const hasNonDigit = /\D/.test(rawValue);
                                    const value = rawValue.replace(/\D/g, '');
                                    if (value.length <= 3) {
                                        setCvv(value);
                                        if (hasNonDigit) {
                                            setFormErrors(prev => ({ ...prev, cvv: 'Yalnızca rakamlardan oluşmalıdır.' }));
                                        } else {
                                            const validation = validateCvv(value);
                                            setFormErrors(prev => ({ ...prev, cvv: validation.isValid ? '' : (validation.message || '') }));
                                        }
                                    }
                                }}
                                maxLength={3}
                            />
                            {formErrors.cvv && (
                                <span className="pp-error-message">{formErrors.cvv}</span>
                            )}
                        </div>
                    </div>

                    {/* Checkbox Group */}
                    <div className="pp-toggles">
                        <div className="pp-toggle-item">
                            <div
                                className={`pp-toggle-switch ${offerDetailsAccepted ? 'active' : ''}`}
                                onClick={() => setOfferDetailsAccepted(!offerDetailsAccepted)}
                            >
                                <div className="pp-toggle-knob">{offerDetailsAccepted ? '✓' : '✕'}</div>
                            </div>
                            <p className="pp-toggle-text">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleViewOfferDocument();
                                    }}
                                  
                                >
                                    <strong>Teklif detaylarını</strong>
                                </a> okudum, onaylıyorum.
                            </p>
                        </div>

                        <div className="pp-toggle-item">
                            <div
                                className={`pp-toggle-switch ${preInfoFormAccepted ? 'active' : ''} ${isSendingPreInfoForm ? 'disabled' : ''}`}
                                onClick={() => {
                                    if (!isSendingPreInfoForm) {
                                        setPreInfoFormAccepted(!preInfoFormAccepted);
                                    }
                                }}
                            >
                                <div className="pp-toggle-knob">{preInfoFormAccepted ? '✓' : '✕'}</div>
                            </div>
                            <p className="pp-toggle-text">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (!isSendingPreInfoForm) {
                                            handleViewPreInfoForm();
                                        }
                                    }}
                                    style={{
                                        pointerEvents: isSendingPreInfoForm ? 'none' : 'auto',
                                        opacity: isSendingPreInfoForm ? 0.6 : 1,
                                        cursor: isSendingPreInfoForm ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <strong>Ön Bilgilendirme Formu</strong>
                                </a> 'nu okudum, kabul ediyorum.
                                {isSendingPreInfoForm && (
                                    <span style={{ marginLeft: '8px', display: 'inline-block' }}>
                                        <span className="pp-btn-spinner" style={{ 
                                            width: '12px', 
                                            height: '12px', 
                                            borderWidth: '2px',
                                            display: 'inline-block',
                                            verticalAlign: 'middle'
                                        }}></span>
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pp-button-group">
                        <button
                            className="pp-btn-submit"
                            onClick={handlePayment}
                            disabled={isProcessing || !isFormValid}
                        >
                            {isProcessing ? 'İşleniyor...' : 'Güvenli Ödemeye Git'}
                        </button>
                    </div>
                </div>

                {/* Sağ Taraf - Sipariş Özeti */}
                <div className="pp-card pp-summary-card">
                    <div className="pp-summary-header">
                        <h3 className="pp-summary-title">Sipariş Özeti</h3>
                        <div className="pp-summary-logo-mobile">
                            {selectedQuoteData?.insuranceCompanyLogo ? (
                                <img
                                    src={selectedQuoteData.insuranceCompanyLogo}
                                    alt={selectedQuoteData.company || 'Sigorta Şirketi'}
                                    style={selectedQuoteData.insuranceCompanyLogo?.includes('hdi-katilim') ? { maxWidth: '80px', maxHeight: '120px', objectFit: 'contain' } : undefined}
                                />
                            ) : (
                                <span className="pp-summary-logo-text">{selectedQuoteData?.company || ''}</span>
                            )}
                        </div>
                    </div>

                    <div className="pp-summary-logo-section">
                        {selectedQuoteData?.insuranceCompanyLogo ? (
                            <img
                                src={selectedQuoteData.insuranceCompanyLogo}
                                alt={selectedQuoteData.company || 'Sigorta Şirketi'}
                                style={selectedQuoteData.insuranceCompanyLogo?.includes('hdi-katilim') 
                                    ? { maxWidth: '80px', maxHeight: '120px', objectFit: 'contain' } 
                                    : { maxWidth: '150px', maxHeight: '120px', objectFit: 'contain' }}
                            />
                        ) : (
                            <div className="pp-summary-logo-placeholder">
                                {selectedQuoteData?.company || 'Logo'}
                            </div>
                        )}
                    </div>

                    <div className="pp-summary-details">
                        <div className="pp-summary-details-left">
                            <div className="pp-summary-installment">
                                {currentPremium?.installmentNumber === 1 ? 'Peşin Ödeme' : `${currentPremium?.installmentNumber} Taksit`}
                            </div>
                            {selectedQuoteData?.hasUndamagedDiscount && selectedQuoteData?.hasUndamagedDiscountRate && (
                                <div className="pp-summary-discount">
                                    %{selectedQuoteData.hasUndamagedDiscountRate} Hasarsızlık İndirimi
                                </div>
                            )}
                        </div>

                        <div className="pp-summary-total-section">
                            <span className="pp-summary-total-label">Toplam:</span>
                            <span className="pp-summary-total-price">
                                {currentPremium?.formattedGrossPremium ?? currentPremium?.grossPremium.toLocaleString('tr-TR')} ₺
                            </span>
                        </div>
                    </div>

                    <button
                        className="pp-btn-back-to-quotes"
                        onClick={() => {
                            if (onBack) {
                                onBack();
                            } else {
                                window.history.back();
                            }
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.00065 8.00003C4.00389 7.64929 4.14521 7.31396 4.39398 7.06669L7.25398 4.20003C7.37889 4.07586 7.54786 4.00616 7.72398 4.00616C7.90011 4.00616 8.06908 4.07586 8.19398 4.20003C8.25647 4.262 8.30607 4.33574 8.33991 4.41698C8.37376 4.49821 8.39118 4.58535 8.39118 4.67336C8.39118 4.76137 8.37376 4.8485 8.33991 4.92974C8.30607 5.01098 8.25647 5.08472 8.19398 5.14669L6.00065 7.33336H12.6673C12.8441 7.33336 13.0137 7.4036 13.1387 7.52862C13.2637 7.65365 13.334 7.82322 13.334 8.00003C13.334 8.17684 13.2637 8.34641 13.1387 8.47143C13.0137 8.59646 12.8441 8.66669 12.6673 8.66669H6.00065L8.19398 10.86C8.31952 10.9847 8.3904 11.1541 8.39102 11.331C8.39165 11.5079 8.32197 11.6778 8.19732 11.8034C8.07267 11.9289 7.90325 11.9998 7.72634 12.0004C7.54943 12.001 7.37952 11.9313 7.25398 11.8067L4.39398 8.94003C4.14359 8.69113 4.00214 8.35308 4.00065 8.00003Z" fill="#00D4A6" />
                        </svg>
                        Tekliflere Geri Dön
                    </button>

                    {/* <div className="offer-banner offer-banner-car-bg offer-banner-purchase offer-banner-kasko" >
                        <div className="offer-banner__content">
                            <h3>Tamamlayıcı<br/> Sağlık Sigortası</h3>
                            <p>Sağlığınızı da güvence altına alın.<br/>250.000 TL</p>
                            <ul>
                                <li>Bu teklif <b>%15 indirimli fiyat</b> üzerinden  sunulmaktadır.</li>
                                <li>Yalnızca bu poliçe satın alımıyla birlikte geçerlidir.</li>
                            </ul>
                        </div>
                        <div className="offer-banner__cta">
                            <a className="btn btn-wide btn-tertiary" href="/kasko-sigortasi" target="_self">Hemen Teklif Alın</a>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* 3D Payment Modal */}
            {showCanvas && canvasHtmlContent && (
                <SimpleIframe3D
                    htmlContent={canvasHtmlContent}
                    onSuccess={(result: any) => {
                        setShowCanvas(false);
                        setCanvasHtmlContent('');
                        proceedWithPurchase(result);
                    }}
                    onError={(error: string) => {
                        cleanupLocalStorage();
                        setShowCanvas(false);
                        setCanvasHtmlContent('');
                        setErrorMessage(`3D doğrulama başarısız: ${error}`);
                        setIsProcessing(false);
                    }}
                    onClose={() => {
                        cleanupLocalStorage();
                        setShowCanvas(false);
                        setCanvasHtmlContent('');
                        setErrorMessage('3D doğrulama iptal edildi.');
                        setIsProcessing(false);
                    }}
                />
            )}

            {/* Document Error Modal */}
            <DocumentErrorModal
                isOpen={showDocumentErrorModal}
                onClose={() => setShowDocumentErrorModal(false)}
            />
        </>
    );
}

