import Hero from '../components/Hero';
import RiskCoverage from '../components/RiskCoverage';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import Plans from '../components/Plans';
import YuvamGuvendeQuoteFlow from '../components/YuvamGuvendeQuote/YuvamGuvendeQuoteFlow';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import './yuvamguvende.css';
import { Metadata } from 'next';

// GEÇİCİ: Google tarafından indexlenmemesi için
// Yayına almak için aşağıdaki metadata export'unu kaldırın veya robots değerlerini değiştirin
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    }
  }
};

export default function YuvamGuvendePage() {
  return (
    <div className="landing-page">
      <Hero />
      <RiskCoverage />
      <Services />
    
      <Testimonials />
      <Plans />
      
      <section className="yg-quote-section">
        <YuvamGuvendeQuoteFlow />
      </section>
      
      <FAQ />
      <Footer />
    </div>
  );
}

