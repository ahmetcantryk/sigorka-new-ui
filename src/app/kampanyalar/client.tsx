'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../../styles/subpage.min.css';

export type Kampanya = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  detailImage: string;
  badge?: string;
  order?: number;
  category?: string;
  status?: 'active' | 'expired';
};

interface KampanyalarClientProps {
  kampanyalar: Kampanya[];
}

export default function KampanyalarClient({ kampanyalar }: KampanyalarClientProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  // Kampanyaları status'e göre filtrele
  const filteredKampanyalar = kampanyalar.filter(k => 
    k.status === activeTab || (!k.status && activeTab === 'active')
  );

  return (
    <>
      <section className="cover cover--sm">
        <div className="container cover__container">
          <h1 className="cover__title-2">Kampanyalar</h1>
        </div>
      </section>
      <section className="campaigns-page-content">
        <div className="container">
          <div className="campaigns-tab">
            <a 
              className={`campaigns-tab__item ${activeTab === 'active' ? 'campaigns-tab__item--active' : ''}`} 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('active');
              }}
            >
              Güncel Kampanyalar
            </a>
            <a 
              className={`campaigns-tab__item ${activeTab === 'expired' ? 'campaigns-tab__item--active' : ''}`} 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('expired');
              }}
            >
              Biten Kampanyalar
            </a>
          </div>
          <div className="campaign-list">
            <div className="row">
              {filteredKampanyalar.map((kampanya) => (
                <div key={kampanya.slug} className="col-lg-4 col-md-6 mb-4">
                  <Link href={`/kampanyalar/${kampanya.slug}`} className="campaign-item">
                    <Image 
                      src={kampanya.image} 
                      className="campaign-item__img img-fluid" 
                      alt={kampanya.title}
                      width={792}
                      height={662}
                    />
                    <div className="campaign-item__content">
                      <h3 className="campaign-item__title" dangerouslySetInnerHTML={{ __html: kampanya.title }} />
                      <span className="campaign-item__link">
                        Detaylı Bilgi <span className="icon-arrow-right"></span>
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

