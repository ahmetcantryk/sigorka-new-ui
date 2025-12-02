"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Breadcrumb from '../components/common/Breadcrumb';
import FaqList from '../components/common/FaqList';
import ProductBanner from '../components/common/ProductBanner';
import StickyProductNav from '../components/common/StickyProductNav';
import ConditionalCTAPopup from '../components/common/ConditionalCTAPopup';
import { productAnchors, getOfferLink } from '../../config/productAnchors';
import ProductPageManager from '@/components/ProductPageFlow/shared/ProductPageManager';
import { useProductPageQuery } from '@/components/ProductPageFlow/shared/hooks/useProductPageQuery';
import '../../styles/subpage.min.css';
import '../../styles/armorbroker.css';
import '../../styles/product-flow/product-page-flow.css';

// Dynamic imports for better code splitting
const DaskProductForm = dynamic(
  () => import('@/components/ProductPageFlow/DaskFlow').then(mod => mod.DaskProductForm),
  { ssr: false } // Form is client-only
);

const DaskProductQuote = dynamic(
  () => import('@/components/ProductPageFlow/DaskFlow/DaskProductQuote'),
  { ssr: false } // Quote is client-only
);

const DaskPurchaseStep = dynamic(
  () => import('@/components/ProductPageFlow/DaskFlow/components/purchase/DaskPurchaseStep'),
  { ssr: false } // Purchase is client-only
);

interface FaqQuestion {
  question: string;
  answer: string;
}

const faqs: FaqQuestion[] = [
  {
    question: 'DASK Neleri Kapsar?',
    answer: `Tapuya kayıtlı ve özel mülkiyete tâbi taşınmazlar üzerinde mesken olarak inşa edilmiş binalar, 634 sayılı Kat Mülkiyeti Kanunu kapsamındaki bağımsız bölümler. Bu binaların içinde yer alan ve ticarethane, büro ve benzeri amaçlarla kullanılan bağımsız bölümler. Doğal afetler nedeniyle devlet tarafından yaptırılan veya verilen kredi ile yapılan meskenler. Zorunlu Deprem Sigortası ayrıca yukarıdaki koşullara uyan; Kat irtifakı tesis edilmiş binalar, Tapuda henüz cins tashihi yapılmamış ve tapu kütüğünde vasfı arsa vs. binalar, Tapu tahsisi henüz yapılmamış kooperatif evleri için de geçerlidir`
  },
  {
    question: 'DASK Teminatları Nelerdir?',
    answer: `Aşağıda belirtilen bina bölümleri, bir arada ya da ayrı olarak teminat kapsamındadır: Temeller, Ana duvarlar, Bahçe duvarları, İstinat duvarları, Tavan ve tabanlar, Merdivenler, Asansörler, Sahanlıklar, Koridorlar Çatılar, Bacalar, Bağımsız bölümleri ayıran ortak duvarlar, Yapının listedekine benzer nitelikteki tamamlayıcı bölümleri.`
  },
  {
    question: 'DASK Tüm Sigorta Şirketlerinde Aynı Fiyat mıdır?',
    answer: 'Evet, DASK poliçeleri tüm sigorta poliçelerinde aynı bilgiler ile hesaplandığında aynı primdir.'
  },
  {
    question: 'DASK UAVT Nedir?',
    answer: 'Nüfus ve Vatandaşlık Hizmetleri tarafından 1 Mart 2013 tarihinde hayata geçirilen bir proje olan adres kodu; nüfusa dayalı adres sistemine kayıtlı ve Türkiye sınırları içerisinde yer alan tüm konutlara verilen 10 haneli özel bir koddur. Aynı zamanda UAVT kodu olarak da adlandırılmaktadır.'
  },
  {
    question: 'DASK Hasar Görmüş Konutlar İçin Yapılır Mı ?',
    answer: 'Çevre ve Şehircilik Bakanlığı binaları hasar durumlarına göre ağır, orta ve hafif hasarlı olmak üzere 3\'e ayırıyor. Ağır hasarlı binalara herhangi bir sigortalanma yapılamıyor ve bu binaların yıkılması gerekiyor. Orta hasarlı bina onarılmışsa ya da güçlendirilmişse Sigortalanmasında Bayındırlık ve İskan Bakanlığı tarafından verilen "oturulabilir" durumda olduğunu gösteren uygunluk belgesi yeterli oluyor. Daha önceki bir depremde hafif hasar almış bir binanın sigortalanmasında, sigortalının beyanı esas alınıyor ve sigorta poliçesi bu beyana göre yapılıyor.'
  }
];

// Banner Area Component - Shows form, quote or purchase based on mode
const BannerArea = () => {
  const { activeMode } = useProductPageQuery();

  return (
    <section id="dask-form-banner" className="cover product-page-banner">
      <div className="container">
        {/* Sabit başlık - tüm steplerde görünür */}
        <h1 className="pp-product-title">Zorunlu Deprem Sigortası (DASK)</h1>
        {activeMode === 'purchase' ? (
          <PurchaseWrapper />
        ) : activeMode === 'quote' ? (
          <QuoteWrapper />
        ) : (
          <FormWrapper />
        )}
      </div>
    </section>
  );
};

// Form Wrapper - Handles navigation after proposal created
const FormWrapper = () => {
  const { navigateToQuote } = useProductPageQuery();

  const handleProposalCreated = (proposalId: string) => {
    // Shallow navigation - URL değişir ama sayfa yeniden yüklenmez
    navigateToQuote(proposalId);
  };

  return <DaskProductForm onProposalCreated={handleProposalCreated} />;
};

// Quote Wrapper - Handles quote view (renders inside banner area)
const QuoteWrapper = () => {
  const { query, navigateToDefault, navigateToPurchase } = useProductPageQuery();

  if (!query.proposalId) {
    return null;
  }

  const handlePurchaseClick = (quoteId: string) => {
    console.log('🛒 Purchase clicked for quote:', quoteId);

    // LocalStorage'a kaydet
    localStorage.setItem('selectedProductIdForDask', quoteId);
    localStorage.setItem('currentProposalId', query.proposalId!);

    // Purchase moduna geç (?purchaseId=quoteId&proposalId=xxx)
    navigateToPurchase(quoteId, query.proposalId);

    // Sayfayı en üste scroll et
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth error durumunda ilk stepe yönlendir
  const handleRestart = () => {
    // LocalStorage'ı temizle
    localStorage.removeItem('selectedProductIdForDask');
    localStorage.removeItem('currentProposalId');
    localStorage.removeItem('daskPropertyId');
    localStorage.removeItem('daskProposalId');
    
    // Form moduna dön
    navigateToDefault();
    
    // Sayfayı en üste scroll et
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DaskProductQuote
      proposalId={query.proposalId}
      onPurchaseClick={handlePurchaseClick}
      onBack={navigateToDefault}
      onRestart={handleRestart}
    />
  );
};

// Purchase Wrapper - Handles purchase view (renders inside banner area)
const PurchaseWrapper = () => {
  const { query, navigateToQuote } = useProductPageQuery();

  if (!query.purchaseId) {
    return null;
  }

  const handleBack = () => {
    const proposalId = localStorage.getItem('currentProposalId');
    if (proposalId) {
      navigateToQuote(proposalId);
    }
  };

  const handleNext = () => {
    console.log('✅ Ödeme tamamlandı');
    // Başarılı ödeme sonrası yönlendirme
  };

  return (
    <>
      <div className="product-page-flow-container">
        {/* Stepper - Her zaman görünür */}
        <div className="pp-stepper">
          <div className="pp-step completed">
            <div className="pp-step-visual">
              <span>1</span>
            </div>
            <div className="pp-step-label">
              <span>Kişisel</span>
              <span>Bilgiler</span>
            </div>
          </div>

          <div className="pp-step completed">
            <div className="pp-step-visual">
              <span>2</span>
            </div>
            <div className="pp-step-label">
              <span>Konut</span>
              <span>Bilgileri</span>
            </div>
          </div>

          <div className="pp-step completed">
            <div className="pp-step-visual">
              <span>3</span>
            </div>
            <div className="pp-step-label">
              <span>Teklif</span>
              <span>Karşılaştırma</span>
            </div>
          </div>

          <div className="pp-step active">
            <div className="pp-step-visual">
              <span>4</span>
            </div>
            <div className="pp-step-label">
              <span>Ödeme</span>
            </div>
          </div>
        </div>

        <div className="product-page-form pp-form-wide">
          <DaskPurchaseStep
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>
      </div>
    </>
  );
};

// Product Detail Content Component
const ProductDetailContent = () => {
  return (
    <>
      <BannerArea />
      <section className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'Ürünler', href: '' },
              { name: 'Yuvam', href: '/yuvam' },
              { name: 'Katılım DASK Sigortası' }
            ]}
          />
          <div className="text-content">
            <h3>Depremin ve deprem sonucu meydana gelen yangın, infilak, tsunami ve yer kaymasının doğrudan neden olacağı maddi zararları karşılayan sigortadır.</h3>
            <h4 id="sigorta-nedir">DASK Nedir?</h4>
            <p>Dask zorunlu bir poliçe türüdür. Binanız tamamen ya da kısmi olarak zarar görmüş olsa da teminat altındadır. Deprem sonucu oluşacak maddi zararlar poliçenizde belirtilmiş limitler dahilinde nakit olarak karşılanır.</p>
            <h4 id="teminatlar">DASK Kapsamında Binamın Sigorta Bedelinin Tespiti Nasıl Yapılır?</h4>
            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <tbody>
                  <tr>
                    <th>Betonarme Birim (TL)</th>
                    <td className="rounded-top-right">9.802</td>
                  </tr>
                  <tr>
                    <th>Diğer Birim (TL)</th>
                    <td className="rounded-bottom-right">6.535</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h4>Aşağıdaki tabloda, risk bölgelerine ve yapı tiplerine göre oluşturulan örnek prim hesaplamasını inceleyebilirsiniz.</h4>
            <p>İllerin Risk Bölgelerine ve Yapı Tiplerine Göre Katkı Payı(prim) Miktarları</p>
            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th colSpan={9}>Tüm iller için 100 m²lik Konut Katkı Payı Miktarı (TL)</th>
                  </tr>
                  <tr>
                    <th colSpan={9}>Risk Bölgeleri Primi (TL)</th>
                  </tr>
                </thead>
                <thead>
                  <tr>
                    <th>Yapı Tipi</th>
                    <th>Teminat (100m²)</th>
                    <th>I</th>
                    <th>II</th>
                    <th>III</th>
                    <th>IV</th>
                    <th>V</th>
                    <th>VI</th>
                    <th>VII</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Betonarme</td>
                    <td>980.200 TL</td>
                    <td>2.509</td>
                    <td>2.235</td>
                    <td>1.902</td>
                    <td>1.784</td>
                    <td>1.333</td>
                    <td>951</td>
                    <td>647</td>
                  </tr>
                  <tr>
                    <td className="rounded-bottom-left">Diğer</td>
                    <td>653.500 TL</td>
                    <td>2.947</td>
                    <td>2.522</td>
                    <td>2.215</td>
                    <td>2.071</td>
                    <td>1.660</td>
                    <td>1.104</td>
                    <td className="rounded-bottom-right">647</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h4>DASK Zorunlu mudur?</h4>
            <p>Deprem sigortası zorunlu sigorta çeşitleri arasında yer alır. Yani DASK yaptırmak yasal olarak zorunludur ve deprem sigortası yaptırmamanın belirli yaptırımları vardır.</p>
            <h4>DASK Sigortasının Amacı Nelerdir?</h4>
            <ul className="prop-list">
              <li>Bütün konutları depreme karşı güvence altına almak</li>
              <li>Mali hasarların yükünü reasüre ederek (yeniden sigortalayarak) paylaşmak</li>
              <li>Devletin deprem kaynaklı giderlerini azaltmak ve gelecekte oluşabilecek hasarlar için fon oluşturmak</li>
              <li>Ülkemizde sağlıklı yapılaşmaya katkı sağlamak</li>
              <li>Toplum genelinde sigorta bilincinin gelişmesine destek olmak</li>
            </ul>
            <h4>DASK Prim Hesaplama Nasıl Yapılır?</h4>
            <p>Dask hesaplaması Zorunlu Deprem Sigortası Tarife ve Talimatı'na göre belirlenir. DASK katkı payları (primleri) hesaplanırken ikamet ettiğiniz binanın yapı tarzı, inşa yılı, toplam kat sayısı ve daire yüz ölçümü gibi bilgiler belirleyici olur. Her konutun özelliğine göre farklı bir DASK ücreti belirlense de kendi konutunuz için ödemeniz gereken DASK fiyatı sigorta şirketine göre değişmez.</p>
            <h4>DASK Poliçe Sorgulama Nasıl Yapılır?</h4>
            <p>İnternet üzerinden DASK poliçe sorgulama işlemi 2 farklı şekilde yapılabilir. Bu yollar;</p>
            <ul className="prop-list">
              <li>E-devlet ile DASK poliçe sorgulama</li>
              <li>DASK web sitesinden poliçe sorgulama</li>
            </ul>
            <h4 id="nasil-teklif-alinir">DASK Teklifi Nasıl Alınır?</h4>
            <p>Sigorka.com web sitemiz üzerinden TC kimlik numaranız, adresi kodunuz (uavt kodu) ve konut bilgileriniz ile hızlı bir şekilde DASK teklifi alabilirsiniz. UAVT Kodunuza bu <a href="https://adres.nvi.gov.tr/VatandasIslemleri/AdresSorgu" target="_blank" rel="noreferrer">linke tıklayarak</a> ulaşabilirsiniz.</p>
            <h4>DASK Hasar İhbarında İstenen Belgeler Nelerdir?</h4>
            <p>DASK'ın Zorunlu Deprem Sigortası'ndan faydalanabilmeniz için binanızın tamamen ya da kısmı olarak zarar görmüş olması fark etmez; küçük ya da büyük maddi zararlar için de tazminat talep edilebilir. Depremin ve deprem sonucu meydana gelen yangın, infilak, tsunami ve yer kaymasının doğrudan neden olduğu maddi zararlarınızın, poliçenizde belirtilmiş limitler dahilinde tazmini için gereken bilgi ve belgeler şöyledir:</p>
            <ul className="prop-list">
              <li>Hasar Bildirimi (TC kimlik veya poliçe numarası ile)</li>
              <li>Güncel Tapu Bilgisi</li>
              <li>Hasar Yeri Açık Adresi (Eksper gönderimi ve değerlendirmesinin kolaylığı için)</li>
              <li>Sigortalı Telefonu (Sabit veya cep)</li>
            </ul>
            <h4>Deprem Sonrasında Hasar Meydana Geldiği Taktirde Neler Yapılmalıdır?</h4>
            <p>Deprem sonrasında poliçe ve hasara neden olan depremin bilgileri ile ALO DASK 125 aranmalıdır.</p>
            <h4>DASK Tazminat Ödemeleri Ne Kadar Sürede Yapılır?</h4>
            <p>Tazminat tutarının kesinleşmesi ve evrakların tamamlanmasını takiben, tazminat ödemeleri en geç 1 ay içerisinde yapılır.</p>
          </div>
          <div className="col-12 mb-4">
            <div className="offer-banner offer-banner-home-bg">
              <div className="offer-banner__content">
                <h3>Katılım DASK Sigortasına mı ihtiyacınız var?</h3>
                <p>En uygun Katılım DASK teklifleri için tıklayınız.</p>
              </div>
              <div className="offer-banner__cta">
                <a className="btn btn-wide btn-tertiary" href="/dask" target="_self">
                  Hemen Teklif Alın
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default function DaskSigortasiPage() {
  const anchors = productAnchors['dask'];
  const offerLink = getOfferLink('dask');
  const { activeMode, navigateToDefault } = useProductPageQuery();

  useEffect(() => {
    document.body.classList.add('product-detail-page');
    return () => {
      document.body.classList.remove('product-detail-page');
    };
  }, []);

  // DASK sayfasına özel: /dask veya /dask linklerini yakala ve banner formuna yönlendir
  useEffect(() => {
    const handleDaskTeklifClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href*="/dask"], a[href="/dask"]');

      if (link) {
        const href = link.getAttribute('href');

        if (href && (href.includes('/dask') || href === '/dask')) {
          e.preventDefault();
          e.stopPropagation();

          // URL'i temizle (query parametrelerini kaldır)
          navigateToDefault();

          // Banner formuna smooth scroll
          setTimeout(() => {
            const bannerElement = document.getElementById('dask-form-banner');
            if (bannerElement) {
              const offset = 120; // Sticky navbar yüksekliği için offset
              const elementPosition = bannerElement.offsetTop - offset;
              window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
              });
            } else {
              // Fallback: sayfanın en üstüne scroll
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 100);
        }
      }
    };

    // Event listener ekle
    document.addEventListener('click', handleDaskTeklifClick, true);

    return () => {
      document.removeEventListener('click', handleDaskTeklifClick, true);
    };
  }, [navigateToDefault]);

  return (
    <>
      {/* GEÇICI OLARAK KAPATILDI */}
      {/* <ConditionalCTAPopup
        condition="inactivity"
        inactivityDelay={15}
        config={{
          title: 'DASK Sigortası Teklifi Almak İster misiniz?',
          description: 'Evinizi deprem riskine karşı güvence altına almak için hemen teklif alın.',
          buttonText: 'Hemen Teklif Al',
          buttonLink: '/dask'
        }}
      /> */}

      <StickyProductNav
        anchors={anchors}
        offerLink={offerLink}
        enableMobileScrollBasedVisibility={true}
        formBannerId="dask-form-banner"
      />

      {/* Her zaman aynı içerik - Banner area içinde form/quote değişir */}
      <ProductDetailContent />

      {/* FAQ sadece default modda göster */}
      {activeMode === 'default' && (
        <section className="page-content pt-0">
          <div className="container">
            <h4>DASK Hakkında Sıkça Sorulan Sorular</h4>
            <FaqList faqs={faqs} />
          </div>
        </section>
      )}
    </>
  );
}