/**
 * Kasko Sigortası Ürün Detay Sayfası - Client Component
 * 
 * Query parametrelerine göre farklı içerikler gösterir:
 * - Default: Ürün detay içeriği
 * - ?mode=form: Teklif formu
 * - ?proposalId=xxx: Teklif detayları
 * - ?purchaseId=xxx: Satın alma ekranı
 */

"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
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
const KaskoProductForm = dynamic(
    () => import('@/components/ProductPageFlow/KaskoFlow').then(mod => mod.KaskoProductForm),
    { ssr: false } // Form is client-only
);

const KaskoProductQuote = dynamic(
    () => import('@/components/ProductPageFlow/KaskoFlow/KaskoProductQuote'),
    { ssr: false } // Quote is client-only
);

const PurchaseStepNew = dynamic(
    () => import('@/components/QuoteFlow/KaskoQuote/steps/PurchaseStepNew'),
    { ssr: false } // Purchase is client-only
);

interface FaqQuestion {
    question: string;
    answer: string;
}

interface KaskoSigortasiClientPageProps {
    faqs: FaqQuestion[];
}

// Banner Area Component - Shows form, quote or purchase based on mode
const BannerArea = () => {
    const { activeMode } = useProductPageQuery();

    return (
        <section className="cover product-page-banner">
            <div className="container">
                {/* Sabit başlık - tüm steplerde görünür */}
                {activeMode !== 'default' && (
                    <h1 className="pp-product-title">Kasko Sigortası</h1>
                )}
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
                            { name: 'Aracım', href: '/aracim' },
                            { name: 'Katılım Kasko Sigortası' }
                        ]}
                    />
                    <div className="text-content">
                        <h3>Kasko sigortası aracınıza sizin ya da 3. şahısların vermesi muhtemel zararları karşılayan, poliçe şartlarına uygun olarak ek hizmetler sunabilen sigortadır.</h3>
                        <h4 id="sigorta-nedir">Araç Kasko Sigortası Nedir?</h4>
                        <p>Zorunlu Trafik Sigortası ile sıkça karıştırılan araç kaskosu, araçlar için farklı teminatları kapsar. Kasko ve trafik sigortası arasındaki en önemli farklardan biri, trafik sigortasının Türkiye Cumhuriyeti kapsamında trafiğe çıkan tüm araçlar için zorunlu olmasına rağmen, araç kasko sigortalarının zorunlu olmayışıdır. Ayrıca zorunlu trafik sigortası yalnızca karşı tarafın zararlarını karşılamaya yönelik iken kasko, kendi aracınızın karşılaşabileceği pek çok tehlikeyi ve kazayı içine alan teminatlara sahip avantajlı bir sigorta poliçesidir.</p>
                        <h4>Katılım Kasko Sigortası Nasıl Hesaplanır?</h4>
                        <p>Bir aracın kasko değerini etkileyen pek çok unsur bulunur. Modeli, üretim yılı, araç tipi, hasarı, kilometresi, bu unsurlardan sadece bazıları. Peki, bu kadar faktöre göre araç kasko değeri tam olarak nasıl hesaplanır? Aslında bunun için kalem kalem bir hesaplama yapmak yerine güncel verilerden yardım alınır.<br />Bir sigorta şirketi, araç kasko değerini belirlerken Türkiye Sigortalar Birliği tarafından oluşturulan Kasko Değer Listesi'ni baz alır. Çünkü Kasko Değer Listesi üzerinden farklı marka, model ve üretim yılındaki araçların güncel piyasa değerlerine ulaşılabilir. Her ay güncellenen bu liste sayesinde kasko poliçesi oluşturulurken aracın kasko değeri çıkarılır.</p>
                        <h4>Kasko Poliçesinde Fiyatı Etkileyen Unsurlar</h4>
                        <ul className="prop-list">
                            <li>Sürücünün Yaşı</li>
                            <li>Aracın Yaşı</li>
                            <li>Aracın Marka ve Modeli</li>
                            <li>Sigortalı Mesleği</li>
                            <li>Yaşadığı Şehir</li>
                            <li>Hasarsızlık İndirimi</li>
                        </ul>
                        <p>Ayrıca Kasko poliçelerinde alınan ek teminatlar, ek teminatlardaki limitler, servis seçeneği ve teminatlardaki muafiyetli uygulamalar primi etkilemektedir.</p>
                        <h4 id="teminatlar">Kasko Sigortası Teminatları Nelerdir?</h4>
                        <p>Kasko sigortalarının teminat koşulları poliçe çeşitlerine göre değişiklik gösterir. Ancak yaygın olarak tüm kaskolar, sigorta sahiplerinin aracını farklı risklere karşı güvence altına alır. Güvence altına alınan başlıca riskleri şu şekilde sıralayabiliriz:</p>
                        <ul className="prop-list">
                            <li>Sigortalı aracın motorlu/motorsuz başka bir araç ile çarpışması</li>
                            <li>Aracın üçüncü şahıslar tarafından zarar uğraması, araç içindeki aksesuarların veya aracın çalınması durumundaki maddi zararlar kasko sigortası tarafından teminat altına alınır</li>
                            <li>Sigortalı aracın zarar görmesine neden olan ve kullanıcıdan bağımsız şekilde gerçekleşen yangın</li>
                            <li>Sigortalı aracın 3. şahıslar tarafından çalınması veya buna teşebbüs edilmesi</li>
                        </ul>
                        <p>Bu teminat kapsamı, ana kasko olarak da adlandırılan poliçelerin hemen hepsinde yer alan standart maddelerdir. Ancak Kaskonuza ek teminatlar da ekleyebilir, böylece daha güvenli sürüş keyfi yaşayabilirsiniz. Kaskoda ek teminatların en çok tercih edilenleri İhtiyari mali mesuliyet, ferdi kaza, manevi tazminat, ikame araç, deprem, dolu, sel ve su baskını, kişisel eşya, anahtar kaybı ve yol yardım hizmeti olarak sıralanabilir.</p>
                        <h4>Kasko Sigortası Hasarsızlık İndirimi Nedir?</h4>
                        <p>Hasarsızlık indirimi olarak adlandırılan kavram, kasko sigorta poliçesi bulunan araç sahiplerinin 1 poliçe dönemini hasarsız olarak tanımlayarak elde ettikleri bir indirimdir. Bu araç sahipleri poliçelerini yeniletirken en uygun kasko fiyatları için hak kazanır. Bu sayede araçlarını çok daha uygun maliyetli olarak teminat altına alabilirler. Kısacası bir önceki poliçe sürecinde aracınızın hasar almaması, bir sonraki kaskonuzda sizin için avantajlı fiyatlar sunabilir.</p>
                        <h4>Kasko Sigortası Hasarsızlık İndirim Oranları Nasıl Hesaplanır?</h4>
                        <p>İlk 12 aylık sigorta süresi sonundaki yenilemede %30, İkinci 12 aylık sigorta süresi sonundaki yenilemede %40, Üçüncü 12 aylık sigorta süresi sonundaki yenilemede %50, Dördüncü 12 aylık sigorta süresi sonundaki yenilemede %60 oranlarında indirimlerden faydalanabilirsiniz.</p>
                        <h4 id="avantajlar">Kasko Sigortasının Avantajları Nelerdir?</h4>
                        <p>Kasko Sigortası; sahip olduğu ana teminatların yanı sıra poliçenizde yer alabilecek ek teminatlarla da başınıza gelmesini istemeyeceğiniz pek çok duruma karşı sizi ve aracınızı güvence altına alır. Yani kasko, direkt olarak araç sahibinin faydalarını gözeten bir araç sigortası türüdür.<br />Umarız bu sigortanın sunduğu teminatlardan yararlanmak durumunda kalmazsınız ama hayatın kötü sürprizlerine karşı da önlem almakta fayda var! Şimdi, Kasko Sigortası yaptırmanın avantajlarını sıralayalım.</p>
                        <h5 className="font-weight-bolder">1. Kaza Sonucu Oluşabilecek Hasarları Karşılar</h5>
                        <p>Sadece karşı taraftan kaynaklı kazalarda oluşabilecek olan hasarları değil; sizden kaynaklı olabilecek araç hasarlarını da kısmen ya da tamamen karşılar. Hangi hasarların karşılanabileceği ise poliçede belirtilir.</p>
                        <h5 className="font-weight-bolder">2. Çekici Hizmeti Sunar</h5>
                        <p>Çoğu kazada ya da arızada araç hareket edemez hale geldiği için, çekici büyük önem kazanır. Bu nedenle kaskolar belirli durumlar ve limitler dâhilinde ücretsiz çekici hizmeti de sunar.</p>
                        <h5 className="font-weight-bolder">3. Yedek Araç Verir</h5>
                        <p>Kaza, arıza ve benzeri durumlardan dolayı aracınız onarım sürecinde olduğu ve aracınızı kullanamadığınız için sigorta şirketi tarafından size ikame araç verilir. Böylece yaşanabilecek olan olumsuz durumlardan etkilenmeden günlük yaşantınıza devam edebilirsiniz.</p>
                        <h5 className="font-weight-bolder">4. Hırsızlık Durumunda da Geçerlidir</h5>
                        <p>Çoğu sigorta şirketi, genellikle ek bir bedel ödemek şartıyla hırsızlık gibi durumlarda da kısmen ya da tamamen oluşabilecek zararları telafi ederler. Araç çalınmış ya da çalınmamasına rağmen hırsızlık girişimi sonucu zarar görmüşse sigorta şirketi bu zararları sigorta poliçesinin dâhilinde karşılayabilmektedir.</p>
                        <h5 className="font-weight-bolder">5. Doğal Afetlerde Oluşan Zararı Giderir</h5>
                        <p>Dolu, sağanak yağmur, yangın, toprak kayması, deprem gibi birbirinden farklı doğa olayları sonucu aracınızda meydana gelebilecek zararlar da kasko tarafından karşılanabilmektedir.</p>
                        <h5 className="font-weight-bolder">6. Sağlık Sorunlarında Destek Olur</h5>
                        <p>Teminatlar içerisine eklenebilen sağlık hizmetleri sayesinde kaza sonucu oluşabilecek yaralanma, ölüm gibi can güvenliği ile ilgili durumlarda da sigorta şirketiniz destek olabilmektedir.</p>
                        <h5 className="font-weight-bolder">7. Ek Hizmetler Alınabilir</h5>
                        <p>Bu sigortaları sadece verdikleri standart hizmetlerden ibaret olarak düşünmemeli, aracınıza dair ihtiyacınız olan farklı bir hizmeti de kasko teminatları içerisine ekletebileceğinizi unutmamalısınız. Araç için çilingir hizmeti, araç anahtar kaybı, araç aksesuarlarının sigorta kapsamına alınması gibi pek çok farklı seçenek isteğe bağlı olarak güvenceler içerisine alınabilmektedir.</p>
                        <h4 id="nasil-teklif-alinir">Kasko Sigortası Teklifi Nasıl Alınır?</h4>
                        <p>Araç sahipleri kasko sigortası teklifi alabilmek için bazı bilgileri vermesi gerekir. Aracın markası ve üretim yılı gibi faktörler fiyatın hesaplanmasında etkilidir. Diğer etkili faktörler ise aracın hasarsızlık indiriminin olup olmadığı ve talep edilen ek teminatlardır. Örneğin ana teminatların yer aldığı poliçede genişletilmiş kasko sigortası talep ediliyorsa fiyatın yüksek olması muhtemeldir. Size en uygun ve fiyat avantajlı Katılım Kasko tekliflerinizi ruhsat bilgilerini girerek sigorka.com sitemizden alabilirsiniz.</p>
                    </div>
                </div>
            </section>
        </>
    );
};

// Form Wrapper - Handles navigation after proposal created
const FormWrapper = () => {
    const { navigateToQuote } = useProductPageQuery();

    const handleProposalCreated = (proposalId: string) => {
        // Shallow navigation - URL değişir ama sayfa yeniden yüklenmez
        navigateToQuote(proposalId);
    };

    return <KaskoProductForm onProposalCreated={handleProposalCreated} />;
};

// Quote Wrapper - Handles quote view (renders inside banner area)
const QuoteWrapper = () => {
    const { query, navigateToDefault, navigateToPurchase } = useProductPageQuery();

    if (!query.proposalId) {
        return null;
    }

    const handlePurchaseClick = (quoteId: string) => {
        console.log('🛒 Purchase clicked for quote:', quoteId);
        
        // LocalStorage'a kaydet (PurchaseStepNew için gerekli)
        localStorage.setItem('selectedProductIdForKasko', quoteId);
        localStorage.setItem('currentProposalId', query.proposalId!);
        
        // Purchase moduna geç (?purchaseId=quoteId&proposalId=xxx)
        navigateToPurchase(quoteId, query.proposalId);
        
        // Sayfayı en üste scroll et
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <KaskoProductQuote
            proposalId={query.proposalId}
            onPurchaseClick={handlePurchaseClick}
            onBack={navigateToDefault}
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
        // Başarılı ödeme sonrası yönlendirme PurchaseStepNew içinde yapılıyor
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
                            <span>Araç</span>
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
                    <PurchaseStepNew
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                </div>
            </div>
        </>
    );
};

interface KaskoSigortasiClientPageProps {
    faqs: FaqQuestion[];
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function KaskoSigortasiClientPage({ faqs, searchParams }: KaskoSigortasiClientPageProps) {
    const { activeMode } = useProductPageQuery();

    // Body class için useEffect
    useEffect(() => {
        document.body.classList.add('product-detail-page');
        return () => {
            document.body.classList.remove('product-detail-page');
        };
    }, []);

    return (
        <>
            {/* GEÇICI OLARAK KAPATILDI */}
            {/* <ConditionalCTAPopup
                condition="inactivity"
                inactivityDelay={15}
                config={{
                    title: 'Katılım Kasko Sigortası Teklifi Almak İster misiniz?',
                    description: 'Hemen birkaç dakika içinde en uygun kasko tekliflerini karşılaştırın ve aracınızı güvence altına alın.',
                    buttonText: 'Hemen Teklif Al',
                    buttonLink: '/kasko-sigortasi'
                }}
            /> */}

            <StickyProductNav
                anchors={productAnchors['kasko-sigortasi']}
                offerLink="/kasko-sigortasi"
            />

            {/* Her zaman aynı içerik - Banner area içinde form/quote değişir */}
            <ProductDetailContent />

            {/* FAQ sadece default modda göster */}
            {activeMode === 'default' && (
                <section className="page-content pt-0">
                    <div className="container">
                        <h4>Kasko Sigortası Hakkında Sıkça Sorulan Sorular</h4>
                        <FaqList faqs={faqs} />
                    </div>
                </section>
            )}
        </>
    );
} 