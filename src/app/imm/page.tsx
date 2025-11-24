import { Metadata } from 'next';
import IMMSigortasiPage from './client';

export const metadata: Metadata = {
    title: "İhtiyari Mali Mesuliyet Sigortası | Sigorka",
    description: "Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.",
    alternates: {
      canonical: "https://sigorka.com/elektronik-ileti-onayi"
    },
    openGraph: {
      title: "İhtiyari Mali Mesuliyet Sigortası | Sigorka",
      description: "Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.",
      url: "https://sigorka.com/imm",
      type: "website"
    },
    twitter: {
      title: "İhtiyari Mali Mesuliyet Sigortası | Sigorka",
      description: "Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.",
      card: "summary_large_image"
    }
  };

export default function IMMPage() {
    return <IMMSigortasiPage />;
} 