/**
 * Offline Flow - Request Step
 * 
 * Talep oluşturma ve sonuç ekranı
 */

'use client';

import Image from 'next/image';
import { FileSearch, Phone } from 'lucide-react';
import { OfflineBranchConfig } from '../../types';

// Helper function to parse message and convert phone number to link
const parseMessageWithPhoneLink = (message: string) => {
  // Telefon numarası pattern'i: 0850 404 04 04, 0850 404 04 04', 08504040404 gibi formatlar
  const phonePattern = /(0850\s?\d{3}\s?\d{2}\s?\d{2})/g;
  const parts: Array<{ text: string; isPhone: boolean }> = [];
  let lastIndex = 0;
  let match;
  
  // Reset regex lastIndex
  phonePattern.lastIndex = 0;
  
  while ((match = phonePattern.exec(message)) !== null) {
    // Match'ten önceki kısmı ekle
    if (match.index > lastIndex) {
      parts.push({ text: message.substring(lastIndex, match.index), isPhone: false });
    }
    // Match'i ekle
    parts.push({ text: match[0], isPhone: true });
    lastIndex = phonePattern.lastIndex;
  }
  
  // Kalan kısmı ekle
  if (lastIndex < message.length) {
    parts.push({ text: message.substring(lastIndex), isPhone: false });
  }
  
  // Eğer hiç match yoksa, tüm mesajı döndür
  if (parts.length === 0) {
    return <span>{message}</span>;
  }
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.isPhone) {
          // Telefon numarasını temizle (sadece rakamlar)
          const cleanPhone = part.text.replace(/\s/g, '').replace(/'ü/g, '');
          return (
            <a key={index} href={`tel:${cleanPhone}`} className="pp-phone-link">
              {part.text}
            </a>
          );
        }
        return <span key={index}>{part.text}</span>;
      })}
    </>
  );
};

interface RequestStepProps {
  branchConfig: OfflineBranchConfig;
  isLoading: boolean;
  requestResult: 'idle' | 'success' | 'error' | 'existing';
  error: string | null;
  // Seyahat Sağlık için 18 yaş altı uyarısı
  isUnderAge?: boolean;
  onCreateRequest: () => void;
  onGoHome: () => void;
}

const RequestStep = ({
  branchConfig,
  isLoading,
  requestResult,
  error,
  isUnderAge = false,
  onCreateRequest,
  onGoHome,
}: RequestStepProps) => {
  // Başarılı talep durumu
  if (requestResult === 'success') {
    return (
      <div className="product-page-form">
        <div className="pp-card pp-result-card">
          <div className="pp-result-image">
            <Image 
              src="/images/product-detail/success-tick.svg" 
              alt="Başarılı" 
              width={64} 
              height={64}
              className="pp-result-svg-icon"
            />
          </div>
          <h2 className="pp-result-title pp-text-success">
            Talebiniz Başarıyla Oluşturuldu!
          </h2>
          <p className="pp-result-message">
            {parseMessageWithPhoneLink(branchConfig.successMessage)}
          </p>
          <div className="pp-button-group">
            <button
              type="button"
              className="pp-btn-submit"
              onClick={onGoHome}
            >
              Anasayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mevcut talep var durumu
  if (requestResult === 'existing') {
    return (
      <div className="product-page-form">
        <div className="pp-card pp-result-card">
          <div className="pp-result-icon pp-result-pending">
            <FileSearch size={48} />
          </div>
          <h2 className="pp-result-title pp-text-pending">
            Talebiniz İnceleniyor
          </h2>
          <p className="pp-result-message">
            Devam eden bir talebiniz bulunmaktadır. Uzman ekibimiz en kısa sürede sizinle iletişime geçecektir.
          </p>
          <div className="pp-contact-info">
            <span className="pp-contact-label">Müşteri Hizmetleri Merkezi</span>
            <a href="tel:08504040404" className="pp-contact-link">
              <Phone size={18} />
              <span>0850 404 04 04</span>
            </a>
          </div>
          <div className="pp-button-group">
            <button
              type="button"
              className="pp-btn-submit"
              onClick={onGoHome}
            >
              Anasayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (requestResult === 'error') {
    return (
      <div className="product-page-form">
        <div className="pp-card pp-result-card">
          <div className="pp-result-image">
            <Image 
              src="/images/product-detail/error-x.svg" 
              alt="Hata" 
              width={64} 
              height={64}
              className="pp-result-svg-icon"
            />
          </div>
          <h2 className="pp-result-title pp-text-error">
            Talep Oluşturulamadı
          </h2>
          <p className="pp-result-message">
            Talep oluştururken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.
          </p>
          <div className="pp-contact-info">
            <span className="pp-contact-label">Müşteri Hizmetleri Merkezi</span>
            <a href="tel:08504040404" className="pp-contact-link">
              <Phone size={18} />
              <span>0850 404 04 04</span>
            </a>
          </div>
          <div className="pp-button-group">
            <button
              type="button"
              className="pp-btn-submit"
              onClick={onGoHome}
            >
              Anasayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal talep oluşturma ekranı
  return (
    <div className="product-page-form">
      <div className="pp-card">
        <span className="pp-title">{branchConfig.displayName} Teklif Talebi</span>
        <p className="pp-subtitle pp-request-description">
          {branchConfig.requestDescription}
        </p>

        {branchConfig.id === 'seyahat-saglik' && isUnderAge && (
          <p
            className="pp-underage-warning-text"
            style={{ color: '#d32f2f', fontSize: '14px', marginTop: '8px' }}
          >
            Seyahat Sağlık Sigortası için <strong>18 yaşından büyük olmanız</strong> gerekmektedir.
            Yaşınız bu sınırın altında olduğu için bu ürün için talep oluşturamazsınız.
          </p>
        )}

        <div className="pp-button-group">
          <button
            type="button"
            className="pp-btn-submit"
            onClick={onCreateRequest}
            disabled={isLoading || (branchConfig.id === 'seyahat-saglik' && isUnderAge)}
          >
            {isLoading ? 'Talep Oluşturuluyor...' : 'Talep Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestStep;

