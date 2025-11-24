'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ContactFormData {
  nameSurname: string;
  emailAddress: string;
  message: string;
  phoneNumber: string;
  submittedViaService: boolean;
}

export default function ContactSticker() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('dismissSticker');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const formatPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, '');
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    // Toast gösterimi için bir kütüphane kullanılabilir (örn: react-toastify)
    alert(message); // Şimdilik basit bir alert kullanıyoruz
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const contactFormObject: ContactFormData = {
      nameSurname: formData.get('nameSurname') as string,
      emailAddress: formData.get('emailAddress') as string,
      message: formData.get('message') as string,
      phoneNumber: formatPhoneNumber(formData.get('phoneNumber') as string),
      submittedViaService: true
    };

    if (!contactFormObject.nameSurname || contactFormObject.nameSurname === '') {
      showToast('error', 'Ad Soyad alanı boş bırakılamaz.');
      return;
    }

    if (!contactFormObject.phoneNumber || contactFormObject.phoneNumber === '' || contactFormObject.phoneNumber.length !== 11) {
      showToast('error', 'Geçerli bir telefon numarası giriniz.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://bipol.com.tr/api/SigorkaTools/AddContactForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactFormObject),
      });

      const { success, message } = await response.json();

      if (success) {
        showToast('success', message || 'Talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.');
        setIsDismissed(true);
        sessionStorage.setItem('dismissSticker', 'true');
      } else {
        showToast('error', message || 'Bir hata oluştu.');
      }
    } catch {
      showToast('error', 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDismissed) return null;

  return (
    <>
      {/* Yapışkan Buton */}
      <div className="sticker-container" style={{ display: isFormOpen ? 'none' : 'block' }}>
        <div className="sticker-content">
          <span className="sticker" onClick={() => setIsFormOpen(true)}>
            Sizi Arayalım
          </span>
          <Image
            src="/images/x-lg-43c1a653-9.svg"
            alt="Close"
            className="close-sticker"
            width={24}
            height={24}
            onClick={() => {
              setIsDismissed(true);
              sessionStorage.setItem('dismissSticker', 'true');
            }}
          />
        </div>
      </div>

      {/* İletişim Formu */}
      <div className={`contact-form-container ${isFormOpen ? 'open' : ''}`}>
        <div className="contact-form-content">
          <span className="contact-form-title">
            Formu doldurarak size ulaşmamızı sağlayabilirsiniz.
          </span>
          <form id="contactForm" onSubmit={handleSubmit}>
            <label htmlFor="inputFullName" className="sr-only">Ad Soyad</label>
            <input
              type="text"
              id="inputFullName"
              name="nameSurname"
              className="form-control"
              placeholder="Adınız Soyadınız*"
              required
            />

            <label htmlFor="inputPhone" className="sr-only">Telefon</label>
            <input
              type="tel"
              id="inputPhone"
              name="phoneNumber"
              className="form-control"
              placeholder="Telefon Numaranız*"
              pattern="0[(]\d{3}[)] \d{3} \d{2} \d{2}"
              required
            />

            <label htmlFor="inputEmail" className="sr-only">E-posta</label>
            <input
              type="email"
              id="inputEmail"
              name="emailAddress"
              className="form-control"
              placeholder="Mail Adresiniz"
              suppressHydrationWarning
            />

            <label htmlFor="inputMessage" className="sr-only">Mesaj</label>
            <textarea
              id="inputMessage"
              name="message"
              className="form-control"
              placeholder="Mesajınız"
              rows={5}
            />

            <div className="d-flex align-items-center">
              {isLoading && (
                <div id="contactFormSpinner">
                  <Image
                    src="/images/spinner-f1229d29-9.svg"
                    alt="Loading"
                    width={24}
                    height={24}
                  />
                </div>
              )}
              <button type="submit" className="btn btn-tertiary ml-auto" disabled={isLoading}>
                Gönder
              </button>
            </div>
          </form>
        </div>
        <Image
          src="/images/x-lg-43c1a653-9.svg"
          alt="Close"
          className="close-contact-form"
          width={24}
          height={24}
          onClick={() => setIsFormOpen(false)}
        />
      </div>
    </>
  );
} 