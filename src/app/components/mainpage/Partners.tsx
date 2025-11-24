import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Partners = () => {
  return (
    <section className="partners">
      <div className="partners__container container">
        <h3 className="section-title"><span>Anlaşmalı Sigorta Şirketleri</span></h3>
        <div className="row flex-row justify-content-sm-center partners__scroll">
          <div className="col-md-2 col-5">
            <Link href="/anlasmali-sigorta-sirketleri/bereket-sigorta" className="partners__item">
              <Image 
                src="/images/partners/bereket-sigorta.png" 
                className="partners__item-img" 
                alt="Bereket Sigorta"
                width={114}
                height={29}
              />
            </Link>
          </div>
          <div className="col-md-2 col-5">
            <Link href="/anlasmali-sigorta-sirketleri/hdi-katilim" className="partners__item">
              <Image 
                src="/images/partners/hdi-katilim.png" 
                className="partners__item-img" 
                alt="HDI Katılım Sigorta"
                width={77}
                height={77}
              />
            </Link>
          </div>
          <div className="col-md-2 col-5">
            <Link href="/anlasmali-sigorta-sirketleri/katilim-emeklilik" className="partners__item">  
              <Image 
                src="/images/partners/katilim-emeklilik.png" 
                className="partners__item-img" 
                alt="Katılım Emeklilik"
                width={151}
                height={35}
              />
            </Link>
          </div>
          <div className="col-md-2 col-5">
            <Link href="/anlasmali-sigorta-sirketleri/katilim-emeklilik" className="partners__item">
              <Image 
                src="/images/brand/neova-logo-2.png" 
                className="partners__item-img" 
                alt="Neova Sigorta"
                width={154}
                height={41}
              />
            </Link>
          </div>
          <div className="col-md-2 col-5">
            <Link href="/anlasmali-sigorta-sirketleri/turkiye-katilim-sigorta" className="partners__item">
              <Image 
                src="/images/partners/turkiye-katilim.png" 
                className="partners__item-img" 
                alt="Türkiye Katılım Sigorta"
                width={150}
                height={70}
              />
            </Link>
          </div>
          <div className="col-md-2 col-5">  
            <Link href="/anlasmali-sigorta-sirketleri/turkiye-katilim-hayat-sigorta" className="partners__item">
              <Image 
                src="/images/partners/turkiye-katilim-hayat-sigorta.png" 
                className="partners__item-img" 
                alt="Türkiye Katılım Hayat Sigorta"
                width={150}
                height={70}
              />
            </Link></div>
        </div>
      </div>
    </section>  
  );
};

export default Partners; 