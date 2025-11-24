'use client';

import ConditionalCTAPopup from '../components/common/ConditionalCTAPopup';

export default function AnlasmaliSigortaSirketleriClient() {
  return (
    <ConditionalCTAPopup
      condition="scroll-up"
      config={{
        title: 'Ürünlerimizi Keşfetmek İster misiniz?',
        description: 'Katılım sigortacılığı prensiplerine uygun tüm sigorta ürünlerimizi inceleyin.',
        buttonText: 'Ürünleri İncele',
        buttonLink: '/urunlerimiz'
      }}
    />
  );
}
