import "./globals.css";
import { Source_Sans_3, Poppins, Roboto, Inter } from 'next/font/google';
import type { Metadata } from 'next';
import ConditionalLayout from './components/ConditionalLayout';
import Script from 'next/script';
import UTMHandler from './components/UTMHandler';

// Bootstrap Icons ve Font Awesome CSS'lerini ekle
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// PrimeReact CSS - Core ve Bootstrap Theme
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primeicons/primeicons.css';

// import "../styles/armorbroker.css";
// import "./styles/promo.css";
import "../styles/main.min.css";

// import "../styles/global-main.css";

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-source-sans-3',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const roboto = Roboto({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sigorka | Katılım Sigortacılığına Modern Yaklaşım',
  description: 'Sigorta dünyasını yüksek hizmet kalitesiyle yeniden tanımlayan Sigorka ile katılım sigortacılığında dijital ve kullanıcı dostu çözümler sizi bekliyor.',
  metadataBase: new URL('https://sigorka.com'),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://sigorka.com/',
    siteName: 'Sigorka.com',
    title: 'Sigorka | Katılım Sigortacılığına Modern Yaklaşım',
    description: 'Sigorta dünyasını yüksek hizmet kalitesiyle yeniden tanımlayan Sigorka ile katılım sigortacılığında dijital ve kullanıcı dostu çözümler sizi bekliyor.',
    images: [
      {
        url: 'https://sigorka.com/images/sigorka-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sigorka | Katılım Sigortacılığına Modern Yaklaşım'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sigorka',
    title: 'Sigorka | Katılım Sigortacılığına Modern Yaklaşım',
    description: 'Sigorta dünyasını yüksek hizmet kalitesiyle yeniden tanımlayan Sigorka ile katılım sigortacılığında dijital ve kullanıcı dostu çözümler sizi bekliyor.',
    images: ['https://sigorka.com/images/sigorka-og-image.png']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${sourceSans3.variable} ${poppins.variable} ${roboto.variable} ${inter.className}`}>
      <head suppressHydrationWarning>
        {/* JSON-LD WebSite Schema - Google arama sonuçlarında site adı için */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Sigorka.com",
              "url": "https://sigorka.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://sigorka.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NWT9VH7P');
            `,
          }}
        />
        {/* End Google Tag Manager */}
        
        {/* Efilli Script */}
        <Script
          src="https://bundles.efilli.com/sigorka.com.prod.js"
          strategy="afterInteractive"
        />
        {/* End Efilli Script */}
        
        {/* Segmage Script */}
        <Script
          id="segmage-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s,l,b){window.Segmage=[];segmage=function(){Segmage.push(Array.prototype.slice.call(arguments));};var doc=document.createElement('script'),scr = document.getElementsByTagName('script')[0];doc.type='text/javascript';doc.async = true;doc.src=s;scr.parentNode.insertBefore(doc, scr);segmage('init',l,b,'p');})('https://cdn.segmage.com/segmage.min.js','tr','48694ce6-5f33-4034-0a38-08de2c6b2669');`,
          }}
        />
        {/* End Segmage Script */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-NWT9VH7P"
            height="0" 
            width="0" 
            style={{display:'none',visibility:'hidden'}}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {/* Chatbot Widget Script */}
        <Script
          src="https://insurai.test.onlyjs.com/chatbot/chatbot-widget.js"
          type="text/javascript"
          strategy="afterInteractive"
        />
        {/* End Chatbot Widget Script */}
        
        <UTMHandler />
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
