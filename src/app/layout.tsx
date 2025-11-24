import "./globals.css";
import { Source_Sans_3, Poppins, Roboto, Inter } from 'next/font/google';
import type { Metadata } from 'next';
import ConditionalLayout from './components/ConditionalLayout';
import Script from 'next/script';
import UTMHandler from './components/UTMHandler';
import AltinOrumcekPopup from '@/components/common/AltinOrumcekPopup';

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
  title: 'Sigorka - Katılım Sigortacılığı',
  description: 'Sigorka ile güvenli ve uygun fiyatlı sigorta çözümleri. Kasko, trafik, sağlık, DASK ve daha fazlası için hemen teklif alın.',
  metadataBase: new URL('https://sigorka.com'),
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://sigorka.com',
    siteName: 'Sigorka - Katılım Sigortacılığı',
    title: 'Sigorka - Katılım Sigortacılığı',
    description: 'Sigorka ile güvenli ve uygun fiyatlı sigorta çözümleri. Kasko, trafik, sağlık, DASK ve daha fazlası için hemen teklif alın.',
    images: [
      {
        url: '/images/sigorka-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sigorka - Katılım Sigortacılığı'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sigorka - Katılım Sigortacılığı',
    description: 'Sigorka ile güvenli ve uygun fiyatlı sigorta çözümleri. Kasko, trafik, sağlık, DASK ve daha fazlası için hemen teklif alın.',
    images: ['/images/sigorka-og-image.png']
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
        <AltinOrumcekPopup />
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
