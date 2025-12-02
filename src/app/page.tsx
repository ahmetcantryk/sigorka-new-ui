export const metadata = {
  title: "Sigorka | Katılım Sigortacılığına Modern Yaklaşım",
  description: "Sigorta dünyasını yüksek hizmet kalitesiyle yeniden tanımlayan Sigorka ile katılım sigortacılığında dijital ve kullanıcı dostu çözümler sizi bekliyor.",
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/"
  },
  openGraph: {
    title: "Sigorka | Katılım Sigortacılığına Modern Yaklaşım",
    description: "Sigorta dünyasını yüksek hizmet kalitesiyle yeniden tanımlayan Sigorka ile katılım sigortacılığında dijital ve kullanıcı dostu çözümler sizi bekliyor.",
    url: "https://sigorka.com/",
    siteName: "Sigorka.com",
    type: "website",
    images: [
      {
        url: "https://sigorka.com/images/sigorka-og-image.png",
        width: 1200,
        height: 630,
        alt: "Sigorka | Katılım Sigortacılığına Modern Yaklaşım"
      }
    ]
  },
  twitter: {
    title: "Sigorka | Katılım Sigortacılığına Modern Yaklaşım",
    description: "Sigorta dünyasını yüksek hizmet kalitesiyle yeniden tanımlayan Sigorka ile katılım sigortacılığında dijital ve kullanıcı dostu çözümler sizi bekliyor.",
    card: "summary_large_image",
    images: ["https://sigorka.com/images/sigorka-og-image.png"]
  }
};

import HomeClient from './components/mainpage/HomeClient';

export default function Home() {
  return <HomeClient />;
}
