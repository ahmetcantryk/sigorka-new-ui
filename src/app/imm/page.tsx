import { Metadata } from 'next';
import IMMSigortasiClientPage from './client';

export const metadata: Metadata = {
    title: "İhtiyari Mali Mesuliyet Sigortası | Sigorka",
    description: "Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.",
    alternates: {
      canonical: "https://sigorka.com/imm"
    },
    openGraph: {
      title: "İhtiyari Mali Mesuliyet Sigortası | Sigorka",
      description: "Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.",
      url: "https://sigorka.com/imm",
      type: "website",
      images: [
        {
          url: "https://sigorka.com/images/sigorka-og-image.png",
          width: 1200,
          height: 630,
          alt: "İhtiyari Mali Mesuliyet Sigortası | Sigorka"
        }
      ]
    },
    twitter: {
      title: "İhtiyari Mali Mesuliyet Sigortası | Sigorka",
      description: "Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.",
      card: "summary_large_image",
      images: ["https://sigorka.com/images/sigorka-og-image.png"]
    }
  };

export default async function IMMPage({ searchParams }: any) {
    const params = await searchParams;
    return <IMMSigortasiClientPage searchParams={params} />;
}
