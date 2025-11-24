import ContactForm from '@/components/ContactForm/ContactForm';
import FAQ from '@/components/FAQ/FAQ';
import { fetchWithAuth } from '../../../services/fetchWithAuth';

const HelpPage = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yardım</h1>
        <p className="mt-1 text-gray-500">Size nasıl yardımcı olabiliriz?</p>
      </div>

      <div className="space-y-12">
        {/* İletişim Formu */}
        <div className="shadow-xs rounded-xl border border-gray-100 bg-white p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Bize Ulaşın</h2>
            <p className="mt-1 text-gray-500">
              Sorularınız için iletişim formunu kullanabilirsiniz
            </p>
          </div>
          <ContactForm />
        </div>

        {/* Sık Sorulan Sorular */}
        <div className="shadow-xs rounded-xl border border-gray-100 bg-white p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Sık Sorulan Sorular</h2>
            <p className="mt-1 text-gray-500">
              En çok sorulan soruların cevaplarını bulabilirsiniz
            </p>
          </div>
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
