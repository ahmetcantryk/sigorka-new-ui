import { Metadata } from 'next';
import SeyahatSaglikSigortasiPage from './client';

export const metadata: Metadata = {
    title: 'Seyahat Sağlık Sigortası - Yurt Dışı ve Vize | Sigorka',
    description: "Yurt dışı seyahatlerinizde sağlığınızı güvence altına alın ve vize başvurularınızda sorun yaşamayın. Sigorka'dan online seyahat sağlık sigortası teklifi alın.",
};

export default function SeyahatSaglikPage() {
    return <SeyahatSaglikSigortasiPage />;
} 