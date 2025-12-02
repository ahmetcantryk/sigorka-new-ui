import { Category } from '../[slug]/page';

// Blog kategorisine göre uygun ürün öner
// Python çıktısına göre mevcut kategoriler:
// - Araç Sigortası (arac-sigortasi)
// - DASK (dask)
// - Dask (dask)
// - Ferdi Kaza Sigortası (ferdi-kaza-sigortasi)
// - Katılım Sağlık Sigortası (katilim-saglik-sigortasi)
// - Katılım Sigortası (katilim-sigortasi)
// - Yaşam (yasam)
// - İMM Sigortası (imm-sigortasi)

export const getCTAConfigForBlog = (categories?: Category[]) => {
  // Kategoriye göre ürün mapping
  if (!categories || categories.length === 0) {
    return {
      title: 'Katılım Sigortalarını Keşfedin',
      description: 'Faizsiz ve etik sigorta çözümleri için ürünlerimizi inceleyin.',
      buttonText: 'Ürünleri İncele',
      buttonLink: '/urunlerimiz'
    };
  }

  const categoryValue = categories[0].value || '';
  const categoryName = categories[0].name || '';
  
  // 1. Araç Sigortası → Kasko
  if (categoryValue === 'arac-sigortasi' || categoryName === 'Araç Sigortası') {
    return {
      title: 'Katılım Kasko Sigortasına mı ihtiyacınız var?',
      description: 'En uygun tekliflerle aracınızı kaskolamak için şimdi teklif alın.',
      buttonText: 'Hemen Teklif Alın',
      buttonLink: '/kasko-sigortasi'
    };
  }

  // 2. İMM Sigortası
  if (categoryValue === 'imm-sigortasi' || categoryName === 'İMM Sigortası') {
    return {
      title: 'İMM Sigortasına mı ihtiyacınız var?',
      description: 'Mali sorumluluk güvencesi için en uygun İMM sigortası tekliflerini alın.',
      buttonText: 'Hemen Teklif Alın',
      buttonLink: '/imm'
    };
  }

  // 3. Katılım Sağlık Sigortası → Özel Sağlık
  if (categoryValue === 'katilim-saglik-sigortasi' || categoryName === 'Katılım Sağlık Sigortası') {
    return {
      title: 'Özel Sağlık Sigortasına mı ihtiyacınız var?',
      description: 'Kapsamlı sağlık koruması için en uygun özel sağlık sigortası tekliflerini alın.',
      buttonText: 'Hemen Teklif Alın',
      buttonLink: '/ozel-saglik-sigortasi'
    };
  }

  // 4. DASK (hem büyük hem küçük harf)
  if (categoryValue === 'dask' || categoryName === 'DASK' || categoryName === 'Dask') {
    return {
      title: 'DASK Sigortasına mı ihtiyacınız var?',
      description: 'Deprem riskine karşı korunmak için en uygun DASK sigortası tekliflerini alın.',
      buttonText: 'Hemen Teklif Alın',
      buttonLink: '/dask'
    };
  }

  // 5. Ferdi Kaza Sigortası
  if (categoryValue === 'ferdi-kaza-sigortasi' || categoryName === 'Ferdi Kaza Sigortası') {
    return {
      title: 'Ferdi Kaza Sigortasına mı ihtiyacınız var?',
      description: 'Beklenmedik kazalara karşı korunmak için ferdi kaza sigortası tekliflerini inceleyin.',
      buttonText: 'Hemen Teklif Alın',
      buttonLink: '/ferdi-kaza-sigortasi'
    };
  }

  // 6. Katılım Sigortası (genel bilgi) → Ürünler sayfası
  if (categoryValue === 'katilim-sigortasi' || categoryName === 'Katılım Sigortası') {
    return {
      title: 'Katılım Sigortalarını Keşfedin',
      description: 'Faizsiz ve etik sigorta çözümleri için ürünlerimizi inceleyin.',
      buttonText: 'Ürünleri İncele',
      buttonLink: '/urunlerimiz'
    };
  }

  // 7. Yaşam kategorisi → Ürünler sayfası (Kasko DEĞİL!)
  if (categoryValue === 'yasam' || categoryName === 'Yaşam') {
    return {
      title: 'Katılım Sigortalarını Keşfedin',
      description: 'Faizsiz ve etik sigorta çözümleri için ürünlerimizi inceleyin.',
      buttonText: 'Ürünleri İncele',
      buttonLink: '/urunlerimiz'
    };
  }

  // Default - Ürünler sayfası
  return {
    title: 'Katılım Sigortalarını Keşfedin',
    description: 'Faizsiz ve etik sigorta çözümleri için ürünlerimizi inceleyin.',
    buttonText: 'Ürünleri İncele',
    buttonLink: '/urunlerimiz'
  };
};
