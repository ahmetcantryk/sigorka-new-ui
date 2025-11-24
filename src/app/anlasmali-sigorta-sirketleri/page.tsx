import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import AnlasmaliSigortaSirketleriClient from './client';
import React from 'react';
import '../../styles/subpage.min.css';
import path from 'path';
import { promises as fs } from 'fs';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Anlaşmalı Sigorta Şirketleri | Sigorka Partnerleri",
  description: "Sigorka iş birliğiyle hizmet veren tüm sigortacılık şirketlerini bu sayfa üzerinden inceleyebilir, aralarında detaylı karşılaştırmalar yapabilirsiniz.",
  alternates: {
    canonical: "https://sigorka.com/anlasmali-sigorta-sirketleri"
  },
  openGraph: {
    title: "Anlaşmalı Sigorta Şirketleri | Sigorka Partnerleri",
    description: "Sigorka iş birliğiyle hizmet veren tüm sigortacılık şirketlerini bu sayfa üzerinden inceleyebilir, aralarında detaylı karşılaştırmalar yapabilirsiniz.",
    url: "https://sigorka.com/anlasmali-sigorta-sirketleri",
    type: "website"
  },
  twitter: {
    title: "Anlaşmalı Sigorta Şirketleri | Sigorka Partnerleri",
    description: "Sigorka iş birliğiyle hizmet veren tüm sigortacılık şirketlerini bu sayfa üzerinden inceleyebilir, aralarında detaylı karşılaştırmalar yapabilirsiniz.",
    card: "summary_large_image"
  }
};

export type Sirket = {
  slug: string;
  name: string;
  logo: string;
  logo2x?: string;
  logoClassName?: string;
  summary: string;
  link: string;
  logoWidth: number;
  logoHeight: number;
};

async function getSirketler(): Promise<Sirket[]> {
  const filePath = path.join(process.cwd(), 'src/app/anlasmali-sigorta-sirketleri/sirketler.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export default async function AnlasmaliSigortaSirketleriPage() {
  const sirketler = await getSirketler();
  return (
    <>
      <AnlasmaliSigortaSirketleriClient />
      <Banner title1="Hakkımızda" title2="Anlaşmalı Sigorta Şirketleri" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: "Ana Sayfa", href: "/" },
            { name: "Hakkımızda" },
            { name: "Anlaşmalı Sigorta Şirketleri" }
          ]} />
          <div className="partners-grid">
            {sirketler.map((sirket) => (
              <div key={sirket.slug} className="partners-grid__item">
                <div className="partner-box">
                  <a href={sirket.link} target="_self" className="partner-box__img">
                    <Image
                      src={sirket.logo}
                      alt={sirket.name}
                      width={sirket.logoWidth}
                      height={sirket.logoHeight}
                      className={sirket.logoClassName || ''}
                      priority
                    />
                  </a>
                  <div className="partner-box__content">
                    <h3>{sirket.name}</h3>
                    <p>{sirket.summary}</p>
                    <a className="btn btn-wide btn-outline-bg" href={sirket.link} target="_self">Detaylı Bilgi</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
} 