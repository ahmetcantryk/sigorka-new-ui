import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  variant?: 'landing' | 'dashboard';
}

const faqItems: FAQItem[] = [
  {
    question: 'InsurUp nedir?',
    answer:
      'InsurUp, tüm sigorta ihtiyaçlarınızı tek bir platformdan yönetmenizi sağlayan yenilikçi bir insurtech çözümüdür. Varlıklarınızı kolayca ekleyebilir, poliçelerinizi görüntüleyebilir ve yeni teklifler alabilirsiniz.',
  },
  {
    question: 'Nasıl poliçe satın alabilirim?',
    answer:
      'Poliçe satın almak için öncelikle varlıklarınızı (araç, konut vb.) eklemeniz gerekiyor. Ardından size en uygun teklifleri karşılaştırabilir ve dilediğiniz poliçeyi satın alabilirsiniz.',
  },
  {
    question: 'Mevcut poliçelerimi platforma nasıl ekleyebilirim?',
    answer:
      'Poliçelerim sayfasından mevcut poliçelerinizi manuel olarak ekleyebilir veya sigorta şirketinizden otomatik olarak aktarabilirsiniz.',
  },
  {
    question: 'Hasar durumunda ne yapmalıyım?',
    answer:
      'Hasar durumunda İletişime Geç formunu kullanarak bize ulaşabilirsiniz. Uzman ekibimiz size en kısa sürede yardımcı olacaktır.',
  },
  {
    question: 'Ödeme seçenekleri nelerdir?',
    answer:
      'Kredi kartı ile tek çekim veya taksitli ödeme yapabilirsiniz. Ayrıca havale/EFT ile de ödeme yapabilirsiniz.',
  },
];

const FAQ = ({ variant = 'landing' }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className={variant === 'landing' ? 'mx-auto max-w-3xl' : ''}>
      {variant === 'landing' && (
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Sık Sorulan Sorular</h2>
      )}
      <div className={`divide-y divide-gray-100 ${variant === 'landing' ? 'mb-12 space-y-2' : ''}`}>
        {faqItems.map((item, index) => (
          <div key={index} className={variant === 'landing' ? 'py-8' : 'py-4'}>
            <button
              onClick={() => toggleItem(index)}
              className="flex w-full items-start justify-between text-left"
            >
              <span
                className={`font-medium ${variant === 'landing' ? 'text-lg text-gray-900' : 'text-base text-gray-800'}`}
              >
                {item.question}
              </span>
              <span className="ml-6 flex h-7 items-center">
                <ChevronDown
                  className={`h-5 w-5 ${openIndex === index ? 'rotate-180' : ''} text-gray-500 transition-transform duration-200`}
                />
              </span>
            </button>
            {openIndex === index && (
              <div
                className={`mt-2 ${variant === 'landing' ? 'text-base' : 'text-sm'} pr-6 text-gray-600`}
              >
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
