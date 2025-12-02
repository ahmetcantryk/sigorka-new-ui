import UrunlerimizClient from './client';

export const metadata = {
  title: 'Ürünlerimiz | Sigorka',
  description: 'Sigorka ürünleri - Teklif alabileceğiniz tüm sigorta ürünleri',
  alternates: {
    canonical: "https://sigorka.com/urunlerimiz"
  },
  openGraph: {
    title: 'Ürünlerimiz | Sigorka',
    description: 'Sigorka ürünleri - Teklif alabileceğiniz tüm sigorta ürünleri',
    url: "https://sigorka.com/urunlerimiz",
    type: "website",
    images: [
      {
        url: "https://sigorka.com/images/sigorka-og-image.png",
        width: 1200,
        height: 630,
        alt: "Ürünlerimiz | Sigorka"
      }
    ]
  },
  twitter: {
    title: 'Ürünlerimiz | Sigorka',
    description: 'Sigorka ürünleri - Teklif alabileceğiniz tüm sigorta ürünleri',
    card: "summary_large_image",
    images: ["https://sigorka.com/images/sigorka-og-image.png"]
  }
};

export default function UrunlerimizPage() {
  return <UrunlerimizClient />;
}

