/**
 * İhtiyari Mali Mesuliyet (İMM) Sigortası Ürün Detay Sayfası - Client Component
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
import StickyProductNav from '../components/common/StickyProductNav';
import ConditionalCTAPopup from '../components/common/ConditionalCTAPopup';
import { productAnchors, getOfferLink } from '../../config/productAnchors';
import { useProductPageQuery } from '@/components/ProductPageFlow/shared/hooks/useProductPageQuery';
import '../../styles/subpage.min.css';
import '../../styles/armorbroker.css';
import '../../styles/product-flow/product-page-flow.css';

// Dynamic imports for better code splitting
const ImmProductForm = dynamic(
    () => import('@/components/ProductPageFlow/ImmFlow').then(mod => mod.ImmProductForm),
    { ssr: false } // Form is client-only
);

const ImmProductQuote = dynamic(
    () => import('@/components/ProductPageFlow/ImmFlow/ImmProductQuote'),
    { ssr: false } // Quote is client-only
);

const ImmPurchaseStep = dynamic(
    () => import('@/components/ProductPageFlow/ImmFlow/components/purchase/ImmPurchaseStep'),
    { ssr: false } // Purchase is client-only
);

interface FaqQuestion {
    question: string;
    answer: string;
}

const faqs: FaqQuestion[] = [
  {
    question: 'IMM ne zaman devreye girer?',
    answer: 'İMM, trafik sigortasının tavan sigorta bedelinin toplam hasarı karşılamaya yetmediği zaman devreye giren bir teminattır. Yani kalan hasarı poliçede yer alan limitlere göre karşılar.'
  },
  {
    question: 'IMM poliçem en az ne kadar olmalı?',
    answer: '3.000.000 TL, 10.000.000 TL gibi limitli ve sınırsız İMM olarak adlandırılan limitsiz paket seçenekleri mevcuttur. İhtiyaçlarına ve bütçene göre İMM paketini kendin seçebilirsin. 10.000.000 TL gibi limiti olan paketler belirli bir sınır dahilinde hasarı karşılar.'
  },
  {
    question: 'Sınırsız IMM nasıl yapılır?',
    answer: 'Limitsiz İMM Sigortası yaptırmanız için Kasko Poliçesi zorunluluğu bulunmamaktadır. Trafik Sigortanızın olması yeterlidir. Trafik Sigortanız hangi şirketten olursa olsun limitsiz İMM Sigortasını başka bir katılım sigortasından alabilirsiniz. Size en uygun IMM Sigortası için Sigorka.com web sitemizden teklif alabilir veya Çağrı Merkezimizi arayarak soru ve taleplerinizi uzman danışmanlarımıza iletebilirsiniz.'
  },
  {
    question: 'Motorlu kara taşıtları IMM Sigortası neden önemli?',
    answer: 'İMM, kaza sonrası karşı tarafa verilen zarar bedelinin Zorunlu Trafik Sigortası poliçe limitlerinin üzerinde kalması durumunda, aşılan tutarın sigorta şirketi tarafından güvence altına alınmasını sağlayacağından yüksek araç hasarlı bir trafik kazası durumunda karşı tarafın hasar bedelini teminat altına alır.'
  }
];

// Banner Area Component - Shows form, quote or purchase based on mode
const BannerArea = () => {
    const { activeMode } = useProductPageQuery();

    return (
        <section id="imm-form-banner" className="cover product-page-banner">
            <div className="container">
                {/* Sabit başlık - tüm steplerde görünür */}
                <h1 className="pp-product-title">İhtiyari Mali Mesuliyet (İMM) Sigortası</h1>
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
                            { name: 'Katılım İhtiyari Mali Mesuliyet Sigortası (İMM)' }
                        ]}
                    />
                    <div className="text-content">
                        <h3>İhtiyari Mali Sorumluluk Sigortası, aracın kullanılmasından doğan maddi/hukuki sorumluluğu, Trafik Sigortası limitleri ile varsa Kasko Sigortası kapsamında yer alan, İhtiyari Mali Sorumluluk teminatı limitlerinin üzerinde kalan kısmını sınırsız olarak tazmin eder. Üstelik manevi tazminat talepleri de teminata dahildir. İMM Sigortası yaptırmanız için Kasko Poliçesi zorunluluğu bulunmamaktadır. Trafik Sigortanızın olması yeterlidir.</h3>
                        <h4 id="sigorta-nedir">İhtiyari Mali Mesuliyet Sigortası (İMM) Nedir?</h4>
                        <p>İMM limiti, karşı araca ve üçüncü kişilere verilen hasarların limit dahilinde ödenmesini ifade eder. İMM limitleri sigorta ürünlerinin kapsamına göre değişebilir. 3.000.000 TL, 10.000.000 TL gibi limitli ve sınırsız İMM olarak adlandırılan limitsiz paket seçenekleri mevcuttur. İhtiyaçlarına ve bütçene göre İMM paketini kendiniz seçebilirsiniz.</p>
                        <h4 id="teminat-disi">İMM Sigortasında Neler Teminat Dışındadır?</h4>
                        <p>Aşağıdaki haller sigorta teminatının dışındadır:</p>
                        <ul className="prop-list list-full-width">
                            <li style={{width: '100%'}}>Sigortalının kendisinin uğrayacağı zararlar</li>
                            <li style={{width: '100%'}}>Aracı sevk ve idare edenin, aracı sevk ve idare ederken uğrayacağı zararlar dolayısıyla ileri sürülen talepler</li>
                            <li style={{width: '100%'}}>İşletenin veya aracı sevk edenin eşinin, usul ve füruunun (kendisi ile evlat edinme ilişkisi ile bağlı olanların) ve birlikte yaşadığı kardeşlerinin uğrayacağı zararlar dolayısıyla ileri sürülen talepler</li>
                            <li style={{width: '100%'}}>Araç sahibi ile işleteni arasındaki ilişkide araca gelen zararlar dolayısıyla ileri sürülen talepler</li>
                            <li style={{width: '100%'}}>Poliçede gösterilen aracın ve bu araç ile taşınan malların (yolcu bagajı ve benzeri eşya teminat dahilindedir) veya çekilen şeylerin bozulması zarar ve ziya uğraması yüzünden ileri sürülen talepler</li>
                            <li style={{width: '100%'}}>Çalınan veya gasp edilen aracın sebep olduğu ve Karayolları Trafik Kanunu'na göre işletenin sorumlu olmadığı zararlar ile aracın çalındığını ve/veya gaspedildiğini bilerek binen yolcuların zarara uğramaları nedeniyle ileri sürülen talepler</li>
                            <li style={{width: '100%'}}>Sürat yarışlarına iştirak ve yarış güzergâhında yapılan antrenmanlar sırasında meydana gelebilecek zarar ve ziyan nedeniyle ileri sürülen talepler</li>
                            <li style={{width: '100%'}}>Aracın gözetim, onarım, bakım, alım-satım, araçta değişiklik yapılması amacı ile veya benzeri bir amaçla faaliyette bulunan teşebbüslere bırakılmasından sonra aracın sebep olduğu zararlara ilişkin her türlü talepler</li>
                            <li style={{width: '100%'}}>Patlayıcı ve parlayıcı maddeler taşınması (yedek akaryakıt hariç) sebebiyle meydana gelen zarar ve ziyanlardan dolayı ileri sürülen talepler.</li>
                            <li style={{width: '100%'}}>3713 sayılı Terörle Mücadele Kanununda belirtilen terör eylemlerinde ve bu eylemlerden doğan sabotajda kullanılan araçların neden olduğu ve 2918 sayılı Karayolları Trafik Kanunu'na göre işletenin sorumlu olmadığı zararlar ile aracın terör eylemlerinde kullanıldığını veya kullanılacağını bilerek binen kişilerin zarara uğramaları nedeniyle ileri sürecekleri talepler, aracı terör ve buna bağlı sabotaj eylemlerinde kullanan kişilerin talepleri.</li>
                        </ul>
                        <h4>İMM Ne İşe Yarar?</h4>
                        <p>Trafik kazalarında küçük bir hasar bile maliyeti çok yüksek sonuçlara neden olabiliyor. Bu tür aksilikler başınıza gelmeden İMM sigortası ile kaza sonucu ortaya çıkabilecek yüksek hasar masraflarına karşı bütçenizi koruma altına alabilirsiniz.</p>
                        <h4 id="limitler">İMM Sigortası'nın Limitleri Nelerdir?</h4>
                        <p>İMM limiti, karşı araca ve üçüncü kişilere verilen hasarların limit dahilinde ödenmesini ifade eder. İMM limitleri sigorta ürünlerinin kapsamına göre değişebilir. 3.000.000 TL, 10.000.000 TL gibi limitli ve sınırsız İMM olarak adlandırılan limitsiz paket seçenekleri mevcuttur. İhtiyaçlarınıza ve bütçenize göre İMM paketinizi kendiniz seçebilirsiniz.</p>
                        <h4 id="teminatlar">İMM Sigortası'nın Teminatları Nelerdir?</h4>
                        <p>İMM teminatları da ihtiyari mali mesuliyet gibi farklı limitlere sahiptir. Teminat ve limitleri için aşağıdaki tablomuzu inceleyebilirsiniz. Teminat limitleri düşükten yükseğe doğru farklı avantaj imkanlarıyla sunulur.</p>
                        <h4 id="avantajlar">İMM Yaptırmanın Avantajları Nelerdir?</h4>
                        <p>Eğer İMM teminatının belirli bir limiti varsa, o limitler dahilinde karşı tarafın hasarı karşılanır. Limitsiz İMM teminatında ise karşı tarafın hasarı ne kadar olursa olsun tüm hasar masrafları limit sınırına takılmadan sigorta şirketi tarafından ödenir.</p>
                        <h4>İMM Sigortası Nasıl Sorgulanır?</h4>
                        <p>E-devlet üzerinden sorgulama yapabilirsiniz.</p>
                    </div>
                    <div className="col-12 mb-4">
                        <div className="offer-banner offer-banner-car-bg">
                            <div className="offer-banner__content">
                                <h3>Katılım İMM Sigortasına mı ihtiyacınız var?</h3>
                                <p>En uygun tekliflerle aracınızı kaskolamak için şimdi teklif alın.</p>
                            </div>
                            <div className="offer-banner__cta">
                                <a className="btn btn-wide btn-tertiary" href="/imm" target="_self">
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

// Form Wrapper - Handles navigation after proposal created
const FormWrapper = () => {
    const { navigateToQuote } = useProductPageQuery();

    const handleProposalCreated = (proposalId: string) => {
        // Shallow navigation - URL değişir ama sayfa yeniden yüklenmez
        navigateToQuote(proposalId);
    };

    return <ImmProductForm onProposalCreated={handleProposalCreated} />;
};

// Quote Wrapper - Handles quote view (renders inside banner area)
const QuoteWrapper = () => {
    const { query, navigateToDefault, navigateToPurchase } = useProductPageQuery();

    if (!query.proposalId) {
        return null;
    }

    const handlePurchaseClick = (quoteId: string) => {
        console.log('🛒 Purchase clicked for quote:', quoteId);
        
        // LocalStorage'a kaydet (ImmPurchaseStep için gerekli)
        localStorage.setItem('selectedProductIdForImm', quoteId);
        localStorage.setItem('currentProposalIdImm', query.proposalId!);
        
        // Purchase moduna geç (?purchaseId=quoteId&proposalId=xxx)
        navigateToPurchase(quoteId, query.proposalId);
        
        // Sayfayı en üste scroll et
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <ImmProductQuote
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
        const proposalId = localStorage.getItem('currentProposalIdImm');
        if (proposalId) {
            navigateToQuote(proposalId);
        }
    };

    const handleNext = () => {
        console.log('✅ Ödeme tamamlandı');
        // Başarılı ödeme sonrası yönlendirme ImmPurchaseStep içinde yapılıyor
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
                    <ImmPurchaseStep
                        onNext={handleNext}
                    />
                </div>
            </div>
        </>
    );
};

interface IMMSigortasiClientPageProps {
    faqs?: FaqQuestion[];
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default function IMMSigortasiClientPage({ faqs: propFaqs, searchParams }: IMMSigortasiClientPageProps) {
    const { activeMode, navigateToDefault } = useProductPageQuery();
    const anchors = productAnchors['imm-sigortasi'];
    const offerLink = getOfferLink('imm-sigortasi');

    // Body class için useEffect
    useEffect(() => {
        document.body.classList.add('product-detail-page');
        return () => {
            document.body.classList.remove('product-detail-page');
        };
    }, []);

    // IMM sayfasına özel: /imm veya /imm linklerini yakala ve banner formuna yönlendir
    useEffect(() => {
        const handleImmTeklifClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href*="/imm"], a[href="/imm"], a[href*="/imm"], a[href="/imm"]');
            
            if (link) {
                const href = link.getAttribute('href');
                
                // Sadece /imm veya /imm linklerini yakala
                if (href && (href === '/imm' || href === '/imm' || href.endsWith('/imm') || href.endsWith('/imm'))) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // URL'i temizle (query parametrelerini kaldır)
                    navigateToDefault();
                    
                    // Banner formuna smooth scroll
                    setTimeout(() => {
                        const bannerElement = document.getElementById('imm-form-banner');
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
        document.addEventListener('click', handleImmTeklifClick, true);

        return () => {
            document.removeEventListener('click', handleImmTeklifClick, true);
        };
    }, [navigateToDefault]);

    return (
        <>
            {/* GEÇICI OLARAK KAPATILDI */}
            {/* <ConditionalCTAPopup
                condition="inactivity"
                inactivityDelay={15}
                config={{
                    title: 'İMM Sigortası Teklifi Almak İster misiniz?',
                    description: 'Hemen birkaç dakika içinde en uygun İMM sigortası tekliflerini karşılaştırın.',
                    buttonText: 'Hemen Teklif Al',
                    buttonLink: '/imm'
                }}
            /> */}

            <StickyProductNav
                anchors={anchors}
                offerLink={offerLink}
                enableMobileScrollBasedVisibility={true}
                formBannerId="imm-form-banner"
            />

            {/* Her zaman aynı içerik - Banner area içinde form/quote değişir */}
            <ProductDetailContent />

            {/* FAQ sadece default modda göster */}
            {activeMode === 'default' && (
                <section className="page-content pt-0">
                    <div className="container">
                        <h4>İMM (İhtiyari Mali Mesuliyet Sigortası) Hakkında Sıkça Sorulan Sorular</h4>
                        <FaqList faqs={propFaqs || faqs} />
                    </div>
                </section>
            )}
        </>
    );
}
