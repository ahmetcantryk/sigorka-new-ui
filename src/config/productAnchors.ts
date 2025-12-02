export interface ProductAnchor {
  id: string;
  label: string;
}

export interface ProductNavConfig {
  [key: string]: ProductAnchor[];
}

export const productAnchors: ProductNavConfig = {
  'kasko-sigortasi': [
    { id: 'sigorta-nedir', label: 'Kasko Sigortası Nedir?' },
    { id: 'teminatlar', label: 'Teminatlar' },
    { id: 'avantajlar', label: 'Avantajlar' },
    { id: 'nasil-teklif-alinir', label: 'Nasıl Teklif Alınır?' }
  ],
  'zorunlu-trafik-sigortasi': [
    { id: 'sigorta-nedir', label: 'Zorunlu Trafik Sigortası Nedir?' },
    { id: 'teminatlar', label: 'Teminatlar' },
    { id: 'limitler', label: 'Limitler' },
    { id: 'nasil-teklif-alinir', label: 'Nasıl Teklif Alınır?' },
    { id: 'hasarsizlik-oranlari', label: 'Hasarsızlık Oranları' }
  ],
  'imm-sigortasi': [
    { id: 'sigorta-nedir', label: 'İMM Sigortası Nedir?' },
    { id: 'teminatlar', label: 'Teminatlar' },
    { id: 'limitler', label: 'Limitler' },
    { id: 'avantajlar', label: 'Avantajlar' }
  ],
  'ozel-saglik-sigortasi': [
    { id: 'sigorta-nedir', label: 'Özel Sağlık Sigortası Nedir?' },
    { id: 'avantajlar', label: 'Avantajlar' },
    { id: 'teminat-kapsami', label: 'Teminat Kapsamı' },
    { id: 'nasil-yaptirilir', label: 'Nasıl Yaptırılır?' }
  ],
  'seyahat-saglik-sigortasi': [
    { id: 'sigorta-nedir', label: 'Seyahat Sigortası Nedir?' },
    { id: 'teminatlar', label: 'Teminatlar' },
    { id: 'gecerli-ulkeler', label: 'Geçerli Ülkeler' },
    { id: 'nasil-teklif-alinir', label: 'Nasıl Teklif Alınır?' }
  ],
  'tamamlayici-saglik-sigortasi': [
    { id: 'sigorta-nedir', label: 'Tamamlayıcı Sağlık Sigortası Nedir?' },
    { id: 'teminatlar', label: 'Teminatlar' },
    { id: 'nasil-teklif-alinir', label: 'Nasıl Teklif Alınır?' }
  ],
  'yabanci-saglik-sigortasi': [
    { id: 'sigorta-nedir', label: 'Yabancı Sağlık Sigortası Nedir?' },
    { id: 'avantajlar', label: 'Avantajlar' },
    { id: 'nasil-teklif-alinir', label: 'Nasıl Teklif Alınır?' }
  ],
  // 'acil-saglik-sigortasi': [
  //   { id: 'sigorta-nedir', label: 'Doktorum Benimle Nedir?' },
  //   { id: 'avantajlar', label: 'Avantajlar' },
  //   { id: 'teminat-kapsami', label: 'Teminat Kapsamı' },
  //   { id: 'nasil-yaptirilir', label: 'Nasıl Yaptırılır?' }
  // ],
  'konut-sigortasi': [
    { id: 'sigorta-nedir', label: 'Katılım Sigortası Nedir?' },
    { id: 'teminatlar', label: 'Teminatlar' },
    { id: 'nasil-teklif-alinir', label: 'Nasıl Teklif Alınır?' },
    { id: 'faydalari', label: 'Faydaları' }
  ],
  'ferdi-kaza-sigortasi': [
    { id: 'sigorta-nedir', label: 'Ferdi Kaza Sigortası Nedir?' },
    { id: 'sartlar', label: 'Şartlar' },
    { id: 'kapsam-disi-durumlar', label: 'Kapsam Dışı Durumlar' },
    { id: 'teminatlar', label: 'Teminatlar' },
    { id: 'avantajlar', label: 'Avantajlar' }
  ],
  'dask': [
    { id: 'sigorta-nedir', label: 'DASK Sigortası Nedir?' },
    { id: 'teminatlar', label: 'Teminatlar' },
    { id: 'nasil-teklif-alinir', label: 'Nasıl Teklif Alınır?' }
  ]
};

// Ürün slug'ına göre teklif link'ini döndür
export const getOfferLink = (productSlug: string): string => {
  const offerLinks: { [key: string]: string } = {
    'kasko-sigortasi': '/kasko-sigortasi',
    'zorunlu-trafik-sigortasi': '/zorunlu-trafik-sigortasi',
    'imm-sigortasi': '/imm',
    'ozel-saglik-sigortasi': '/ozel-saglik-sigortasi',
    'seyahat-saglik-sigortasi': '/seyahat-saglik-sigortasi',
    'tamamlayici-saglik-sigortasi': '/tamamlayici-saglik-sigortasi',
    'yabanci-saglik-sigortasi': '/yabanci-saglik-sigortasi',
    'acil-saglik-sigortasi': '/acil-saglik-sigortasi',
    'dask': '/dask',
    'konut-sigortasi': '/konut-sigortasi',
    'ferdi-kaza-sigortasi': '/ferdi-kaza-sigortasi'
  };

  return offerLinks[productSlug] || '/';
};

