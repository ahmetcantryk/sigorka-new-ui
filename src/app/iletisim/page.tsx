export const metadata = {
  title: "İletişim - Sigorka Destek ve İletişim Bilgileri | Sigorka",
  description: "Sorularınız için bize ulaşın! Sigorta işlemlerinizle ilgili tüm destek ve önerileriniz için iletişim bilgilerimize bu sayfa üzerinden ulaşabilirsiniz.",
  alternates: {
    canonical: "https://sigorka.com/iletisim"
  },
  openGraph: {
    title: "İletişim - Sigorka Destek ve İletişim Bilgileri | Sigorka",
    description: "Sorularınız için bize ulaşın! Sigorta işlemlerinizle ilgili tüm destek ve önerileriniz için iletişim bilgilerimize bu sayfa üzerinden ulaşabilirsiniz.",
    url: "https://sigorka.com/iletisim",
    type: "website"
  },
  twitter: {
    title: "İletişim - Sigorka Destek ve İletişim Bilgileri | Sigorka",
    description: "Sorularınız için bize ulaşın! Sigorta işlemlerinizle ilgili tüm destek ve önerileriniz için iletişim bilgilerimize bu sayfa üzerinden ulaşabilirsiniz.",
    card: "summary_large_image"
  }
};

import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import React from 'react';
import '../../styles/subpage.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NewsletterForm from './NewsletterForm';
import Image from 'next/image';
export default function IletisimPage() {
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <Banner title1="" title2="İletişim" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'İletişim' }
          ]} />
          <div className="row flex-row justify-content-center">
            <div className="col-lg-5 col-md-6">
              <div className="contact-item">
                <Image src="/images/icon-location.svg" className="contact-item__icon" alt="Adres" width={40} height={40} />
                <h3 className="contact-item__title">Sigorka.com Merkez Ofisi</h3>
                <p className="contact-item__desc">Sahrayıcedid Mah. Batman Sok. No:30/42 GFY Plaza<br /> Kadıköy | İstanbul</p>
              </div>
            </div>
            <div className="col-lg-5 col-md-6">
              <div className="contact-item">
                <Image src="/images/icon-call-center.svg" className="contact-item__icon" alt="Müşteri Hizmetleri Merkezi" width={40} height={40} />
                <h3 className="contact-item__title">Müşteri Hizmetleri Merkezi</h3>
                <p className="contact-item__desc">
                  <a href="tel:+908504040404" className="contact-item__desc"
                      aria-label="Bizi arayın: 0850 404 04 04"
                      title="Telefon etmek için tıklayın"
                    >
                      0850 404 04 04
                    </a>
                  <br />
                  <a href="mailto:info@sigorka.com" className="contact-item__desc"
                      aria-label="Bize e-posta gönderin: info@sigorka.com"
                      title="E-posta için tıklayın" 
                    >
                      info@sigorka.com
                    </a>
                    
                </p>
              </div>
            </div>
          </div>
          <div className="embed-responsive embed-responsive-21by9 my-5">
            <iframe
              className="embed-responsive-item"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.691202433542!2d29.08012721264292!3d40.988242171233956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac7842485e5a1%3A0x20507a3a2a3ffc41!2sGFY%20PLAZA!5e0!3m2!1str!2str!4v1723495862784!5m2!1str!2str"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <h3>Şirket Bilgileri</h3>
          <div className="row">
            <div className="col-lg-6">
              <div className="contact-row">
                <span className="contact-row__title">Broker Unvanı:</span>
                <span className="contact-row__content">Armor Katılım Sigorta ve Reasürans Brokerliği A.Ş.</span>
              </div>
              <div className="contact-row">
                <span className="contact-row__title">Vergi Dairesi:</span>
                <span className="contact-row__content">Erenköy V.D.</span>
              </div>
              <div className="contact-row">
                <span className="contact-row__title">Vergi No:</span>
                <span className="contact-row__content">0801087700</span>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="contact-row">
                <span className="contact-row__title">Tic. Sic. No:</span>
                <span className="contact-row__content">446428-5</span>
              </div>
              <div className="contact-row">
                <span className="contact-row__title">Mersis No:</span>
                <span className="contact-row__content">0080108770000001</span>
              </div>
              <div className="contact-row">
                <span className="contact-row__title">Kep Adresi:</span>
                <span className="contact-row__content">armorkatilimsigorta@hs03.kep.tr</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="newsletter-section">
        <div className="container">
          <div className="row flex-row align-items-center">
            <div className="col-lg-6">
              <div className="newsletter-section__content">
                <h4>Üye olun, haberiniz olsun</h4>
                <p>Kampanya ve fırsatlarımızdan<br />ilk siz haberdar olun.</p>
              </div>
            </div>
            <div className="col-lg-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 