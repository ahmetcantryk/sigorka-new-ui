'use client';

import { useState } from 'react';

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Yuvam Güvende nedir, neleri kapsar?',
      answer: 'Yuvam Güvende, evinizdeki eşyaları yangın, su baskını, hırsızlık, cam kırılması ve elektrik arızası gibi beklenmedik risklere karşı korur. Hasar durumunda onarım veya tazminat ödemesi yapılır.'
    },
    {
      question: 'Konut sigortasıyla farkı nedir?',
      answer: 'Konut sigortası binayı güvence altına alır, Yuvam Güvende ise sadece eşyalarınızı korur. Bu nedenle kiracılar da poliçeden faydalanabilir.'
    },
    {
      question: 'Poliçeye dahil ek hizmetler neler?',
      answer: 'Ek hizmetler arasında kombi bakımı, klima bakımı, elektrik tesisatı kontrolü ve su tesisatı bakımı gibi hizmetler yer alır.'
    },
    {
      question: 'Ek hizmetleri yılda kaç kez kullanabilirim?',
      answer: 'Ek hizmetlerden yılda bir kez faydalanabilirsiniz. Her hizmet için ayrı hak tanınır.'
    },
    {
      question: 'Hasar oluştuğunda ne yapmalıyım?',
      answer: 'Hasar durumunda 7/24 destek hattımızı arayarak durumu bildirebilirsiniz. Uzman ekibimiz en kısa sürede size yardımcı olacaktır.'
    },
    {
      question: 'Elektronik eşyalar da koruma altında mı?',
      answer: 'Evet, elektronik eşyalarınız da poliçe kapsamındadır. Televizyon, bilgisayar, buzdolabı gibi elektronik cihazlar teminat altındadır.'
    },
    {
      question: 'Hırsızlık durumunda ödeme nasıl yapılır?',
      answer: 'Hırsızlık durumunda çalınan veya zarar gören eşyalarınızın değeri, poliçe limitleri dahilinde karşılanır. Gerekli belgelerin hazırlanmasının ardından ödeme yapılır.'
    },
    {
      question: 'Komşuma zarar verirsem poliçem devreye girer mi?',
      answer: 'Evet, evinizdeki yangın veya su baskını gibi durumlarda komşunuza verdiğiniz zararlar poliçeniz kapsamındadır.'
    },
    {
      question: 'Poliçeyi yenilemezsem ne olur?',
      answer: 'Poliçe süresi sona erdiğinde koruma kapsamı devre dışı kalır. Yenileme yapılmazsa yeni hasarlar karşılanmaz.'
    },
    {
      question: 'Yuvam Güvende faiz içerir mi veya katılım esaslarına uygun mu?',
      answer: 'Evet, Yuvam Güvende katılım sigortacılığı esaslarına uygundur ve faizsizlik prensipleri çerçevesinde çalışır.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // FAQ'ları iki kolona böl
  const leftColumnFAQs = faqs.slice(0, Math.ceil(faqs.length / 2));
  const rightColumnFAQs = faqs.slice(Math.ceil(faqs.length / 2));

  return (
    <section className="faq">
      <div className="faqContainer">
        <div className="faqTitleWrapper">
          <h2 className="faqTitle">Sıkça Sorulan Sorular</h2>
        </div>

        <div className="faqColumns">
          {/* Sol Kolon */}
          <div className="faqColumn">
            {leftColumnFAQs.map((faq, index) => {
              const actualIndex = index;
              const isActive = activeIndex === actualIndex;
              return (
                <div key={actualIndex} className="faqItem" data-active={isActive ? "true" : "false"}>
                  <button
                    className="faqQuestion"
                    onClick={() => toggleFAQ(actualIndex)}
                    aria-expanded={isActive}
                  >
                    <span>{faq.question}</span>
                    <span className="faqIcon">{isActive ? '−' : '+'}</span>
                  </button>
                  <div className="faqAnswer" data-active={isActive ? "true" : "false"}>
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sağ Kolon */}
          <div className="faqColumn">
            {rightColumnFAQs.map((faq, index) => {
              const actualIndex = index + leftColumnFAQs.length;
              const isActive = activeIndex === actualIndex;
              return (
                <div key={actualIndex} className="faqItem" data-active={isActive ? "true" : "false"}>
                  <button
                    className="faqQuestion"
                    onClick={() => toggleFAQ(actualIndex)}
                    aria-expanded={isActive}
                  >
                    <span>{faq.question}</span>
                    <span className="faqIcon">{isActive ? '−' : '+'}</span>
                  </button>
                  <div className="faqAnswer" data-active={isActive ? "true" : "false"}>
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

