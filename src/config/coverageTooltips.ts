/**
 * Branş Bazlı Teminat Tooltip Konfigürasyonu
 * 
 * Her branş için teminat parametrelerinin açıklamalarını içerir.
 * Yeni branş veya teminat eklemek için ilgili objeye ekleme yapın.
 * 
 * Tooltip boş string ("") ise tooltip gösterilmez.
 */

export interface CoverageTooltipConfig {
  [key: string]: {
    label: string;
    tooltip: string;
  };
}

export interface BranchCoverageConfig {
  [branch: string]: CoverageTooltipConfig;
}

export const coverageTooltips: BranchCoverageConfig = {
  // KASKO Teminatları
  kasko: {
    // IMM ve Ferdi Kaza
    immLimitiAyrimsiz: {
      label: "İMM Limiti (Ayrımsız)",
      tooltip: "Üçüncü kişilere verilen maddi ve bedeni zararlar belirlenen limit dahilinde karşılanır."
    },
    ferdiKazaVefat: {
      label: "Ferdi Kaza - Vefat",
      tooltip: "Araç içinde bulunan kişilerin vefatı halinde yakınlarına tazminat ödenir."
    },
    ferdiKazaSakatlik: {
      label: "Ferdi Kaza - Sakatlık",
      tooltip: "Sürücü ve yolcuların kalıcı sakatlık durumunda tazminat ödenir."
    },
    ferdiKazaTedaviMasraflari: {
      label: "Ferdi Kaza - Tedavi Masrafları",
      tooltip: "Kaza sonrası oluşan tedavi giderleri güvence kapsamındadır."
    },

    // Anahtar ve Hırsızlık
    anahtarKaybi: {
      label: "Anahtar Kaybı",
      tooltip: "Aracınızın anahtarının kaybolması veya çalınması durumunda yeni anahtar ve kilit değişimi masraflarını karşılar."
    },
    aracCalinmasi: {
      label: "Araç Çalınması",
      tooltip: "Aracınızın çalınması veya çalınmaya teşebbüs edilmesi halinde maddi zararlarınız ödenir."
    },
    anahtarCalinmasi: {
      label: "Anahtar Çalınması",
      tooltip: "Anahtarınızın çalınması sonucu oluşan masraflar ve zararlar karşılanır."
    },
    hirsizlik: {
      label: "Hırsızlık",
      tooltip: "Aracın veya araç içindeki ekipman ve aksesuarların çalınması halinde zararınız ödenir."
    },

    // Onarım ve Servis
    onarimServisTuru: {
      label: "Onarım Servis Türü",
      tooltip: "Yetkili veya anlaşmalı servis kullanımına göre onarım seçenekleri sunulur."
    },
    yedekParcaTuru: {
      label: "Yedek Parça Türü",
      tooltip: "Onarım sırasında orijinal veya eşdeğer yedek parça kullanılmasına ilişkin garanti sunulur."
    },
    miniOnarim: {
      label: "Mini Onarım",
      tooltip: "Boya gerektirmeyen küçük göçük ve çiziklerin hızlı onarımı ücretsiz yapılır."
    },

    // Cam ve Muafiyet
    camKirilmaMuafeyeti: {
      label: "Cam Kırılma Muafiyeti",
      tooltip: "Cam hasarları poliçe kapsamına alınır; belirli tutara kadar muafiyet uygulanabilir."
    },

    // Kiralık Araç
    kiralikArac: {
      label: "Kiralık Araç",
      tooltip: "Aracın serviste olması durumunda ikame araç sağlanır."
    },

    // Hukuki Koruma
    hukuksalKorumaAracaBagli: {
      label: "Hukuksal Koruma (Araca Bağlı)",
      tooltip: "Araç ile ilgili hukuki uyuşmazlıklarda avukatlık ve mahkeme masrafları teminat altındadır."
    },
    hukuksalKorumaSurucuyeBagli: {
      label: "Hukuksal Koruma (Sürücüye Bağlı)",
      tooltip: "Sürücünün kişisel hukuki uyuşmazlıkları kapsamında hukuki danışmanlık ve masraflar karşılanır."
    },

    // Özel Eşya ve Zarar
    ozelEsya: {
      label: "Özel Eşya",
      tooltip: "Araç içinde taşınan kişisel eşyalarınızın çalınması veya zarar görmesi teminat altındadır."
    },
    maneviTazminat: {
      label: "Manevi Tazminat",
      tooltip: "Trafik kazalarında açılan manevi tazminat davaları poliçe tarafından güvence altındadır."
    },
    // Çeşitli Zararlar
    sigaraMaddeZarari: {
      label: "Sigara/Madde Zararı",
      tooltip: "Sigara ve benzeri maddelerin yol açtığı döşeme ve iç aksam hasarları karşılanır."
    },
    patlayiciMaddeZarari: {
      label: "Patlayıcı Madde Zararı",
      tooltip: "Patlayıcı madde kaynaklı hasarlar poliçe kapsamında karşılanır."
    },
    kemirgenZarari: {
      label: "Kemirgen Zararı",
      tooltip: "Fare vb. kemirgenlerin araca verdiği hasarlar güvence altındadır."
    },
    yukKaymasiZarari: {
      label: "Yük Kayması Zararı",
      tooltip: "Yük taşıyan araçlarda yük kayması sonucu oluşan araç hasarları teminat kapsamındadır."
    },
    eskime: {
      label: "Eskime Payı",
      tooltip: "Onarım sonucu değişen parçaların kullanım eskisi kaynaklı değer farkı poliçe ile teminat altındadır."
    },

    // Özel Durumlar
    hasarsizlikIndirimKoruma: {
      label: "Hasarsızlık İndirimi Koruma",
      tooltip: "Küçük hasarlar nedeniyle hasarsızlık indiriminiz bozulmaz."
    },
    yurtdisiKasko: {
      label: "Yurtdışı Kasko",
      tooltip: "Aracın yurtdışında hasar görmesi veya çalınması durumunda kasko koruması devam eder."
    },
    yolYardim: {
      label: "Yol Yardım",
      tooltip: "Lastik patlaması, akü bitmesi, yakıt bitmesi gibi durumlarda 7/24 çekici ve teknik destek sağlanır."
    },
    yanlisAkaryakitDolumu: {
      label: "Yanlış Akaryakıt Dolumu",
      tooltip: "Yanlış yakıt dolumu sonucu oluşan motor ve sistem hasarları güvence altındadır."
    },

    // Temel Teminatlar
    yanma: {
      label: "Yanma",
      tooltip: "Yangın sonucu araçta meydana gelen maddi zararlar ödenir."
    },
    carpma: {
      label: "Çarpma",
      tooltip: "Sabit ya da hareketli cisimlere çarpma kaynaklı hasarlar güvence altındadır."
    },
    carpisma: {
      label: "Çarpışma",
      tooltip: "Başka bir araçla çarpışma sonucu oluşan hasarlar karşılanır."
    },

    // Doğal Afetler ve Terör
    glkhhTeror: {
      label: "GLKHH - Terör",
      tooltip: "Terör, sabotaj ve benzeri olaylardan oluşan hasarlar karşılanır."
    },
    grevLokavt: {
      label: "Grev/Lokavt",
      tooltip: "Grev, lokavt ve toplumsal olaylar nedeniyle oluşan araç hasarları güvence altındadır."
    },
    dogalAfetler: {
      label: "Doğal Afetler",
      tooltip: "Sel, dolu, fırtına, deprem gibi doğal afetlerden doğan hasarlar karşılanır."
    }
  },

  // TRAFİK Teminatları
  trafik: {
    bedeniZarar: {
      label: "Bedeni Zarar",
      tooltip: ""
    },
    maddiZarar: {
      label: "Maddi Zarar",
      tooltip: ""
    },
    tedaviMasraflari: {
      label: "Tedavi Masrafları",
      tooltip: ""
    }
  },

  // KONUT Teminatları
  konut: {
    yangin: {
      label: "Yangın",
      tooltip: ""
    },
    hirsizlik: {
      label: "Hırsızlık",
      tooltip: ""
    },
    dogalAfetler: {
      label: "Doğal Afetler",
      tooltip: ""
    },
    camKirilmasi: {
      label: "Cam Kırılması",
      tooltip: ""
    },
    suBasmasi: {
      label: "Su Basması",
      tooltip: ""
    },
    elektronikCihaz: {
      label: "Elektronik Cihaz",
      tooltip: ""
    },
    ferdiKaza: {
      label: "Ferdi Kaza",
      tooltip: ""
    }
  },

  // SAĞLIK Teminatları
  saglik: {
    yatakliTedavi: {
      label: "Yataklı Tedavi",
      tooltip: ""
    },
    ayaktaTedavi: {
      label: "Ayakta Tedavi",
      tooltip: ""
    },
    ilac: {
      label: "İlaç",
      tooltip: ""
    },
    ameliyat: {
      label: "Ameliyat",
      tooltip: ""
    },
    dogum: {
      label: "Doğum",
      tooltip: ""
    },
    dis: {
      label: "Diş Tedavisi",
      tooltip: ""
    }
  }
};

/**
 * Label'ı normalize eder (tire, parantez gibi karakterleri kaldırarak eşleştirmeyi kolaylaştırır)
 */
const normalizeLabel = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/\s*-\s*/g, ' ') // Tire'leri boşluğa çevir
    .replace(/\s*\([^)]*\)\s*/g, '') // Parantez içlerini kaldır
    .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
    .trim();
};

/**
 * İki label'ın benzer olup olmadığını kontrol eder (kelime bazlı eşleştirme)
 */
const areLabelsSimilar = (label1: string, label2: string): boolean => {
  const normalized1 = normalizeLabel(label1);
  const normalized2 = normalizeLabel(label2);
  
  // Tam eşleşme
  if (normalized1 === normalized2) return true;
  
  // Bir label diğerinin başlangıcı ise (örn: "Eskime" ve "Eskime Payı")
  if (normalized1.startsWith(normalized2) || normalized2.startsWith(normalized1)) {
    return true;
  }
  
  // Kelime bazlı eşleştirme - tüm kelimeler diğerinde varsa
  const words1 = normalized1.split(' ').filter(w => w.length > 2); // 2 karakterden uzun kelimeler
  const words2 = normalized2.split(' ').filter(w => w.length > 2);
  
  if (words1.length > 0 && words2.length > 0) {
    // Tüm önemli kelimeler eşleşiyorsa
    const allWordsMatch = words1.every(w1 => words2.some(w2 => w1 === w2 || w1.startsWith(w2) || w2.startsWith(w1)));
    if (allWordsMatch) return true;
  }
  
  return false;
};

/**
 * Label eşleştirme mapping'i (farklı label'lar için)
 */
const labelMapping: Record<string, string[]> = {
  'Cam Hasarı': ['Cam Kırılma Muafiyeti', 'camKirilmaMuafeyeti'],
  'Servis Geçerliliği': ['Onarım Servis Türü', 'onarimServisTuru'],
  'İkame Araç': ['Kiralık Araç', 'kiralikArac'],
  'Cam Kırılma Muafiyeti': ['Cam Hasarı', 'camKirilmaMuafeyeti'],
  'Onarım Servis Türü': ['Servis Geçerliliği', 'onarimServisTuru'],
  'Kiralık Araç': ['İkame Araç', 'kiralikArac']
};

/**
 * Belirli bir branş ve teminat için tooltip bilgisini döndürür
 * Boş string ise null döner (tooltip gösterilmez)
 * Önce coverageKey ile, bulamazsa label ile eşleştirme yapar
 */
export const getCoverageTooltip = (branch: string, coverageKey: string): string | null => {
  const branchConfig = coverageTooltips[branch.toLowerCase()];
  if (!branchConfig) return null;
  
  // Önce direkt key ile ara
  let coverage: { label: string; tooltip: string } | undefined = branchConfig[coverageKey];
  
  // Bulamazsa label mapping ile ara
  if (!coverage && labelMapping[coverageKey]) {
    for (const mappedLabel of labelMapping[coverageKey]) {
      // Önce key olarak dene
      coverage = branchConfig[mappedLabel];
      if (coverage) break;
      
      // Sonra label olarak dene
      coverage = Object.values(branchConfig).find(
        (item) => item.label === mappedLabel || item.label.toLowerCase() === mappedLabel.toLowerCase()
      );
      if (coverage) break;
    }
  }
  
  // Bulamazsa label ile ara (tam eşleşme)
  if (!coverage) {
    coverage = Object.values(branchConfig).find(
      (item) => item.label === coverageKey || item.label.toLowerCase() === coverageKey.toLowerCase()
    );
  }
  
  // Hala bulamazsa normalize edilmiş label ile ara
  if (!coverage) {
    const normalizedKey = normalizeLabel(coverageKey);
    coverage = Object.values(branchConfig).find(
      (item) => normalizeLabel(item.label) === normalizedKey
    );
  }
  
  // Hala bulamazsa benzer label ile ara (kelime bazlı eşleştirme)
  if (!coverage) {
    coverage = Object.values(branchConfig).find(
      (item) => areLabelsSimilar(item.label, coverageKey)
    );
  }
  
  // Boş string kontrolü
  if (!coverage?.tooltip || coverage.tooltip.trim() === '') return null;
  return coverage.tooltip;
};

/**
 * Belirli bir branş ve teminat için label bilgisini döndürür
 */
export const getCoverageLabel = (branch: string, coverageKey: string): string | null => {
  const branchConfig = coverageTooltips[branch.toLowerCase()];
  if (!branchConfig) return null;
  
  const coverage = branchConfig[coverageKey];
  return coverage?.label || null;
};

/**
 * Belirli bir branş için tüm teminat konfigürasyonunu döndürür
 */
export const getBranchCoverages = (branch: string): CoverageTooltipConfig | null => {
  return coverageTooltips[branch.toLowerCase()] || null;
};

/**
 * Teminat değerini formatlar
 */
export const formatCoverageValue = (type: string, value?: any): string => {
  switch (type) {
    case 'DECIMAL':
      return value ? `${Number(value).toLocaleString('tr-TR')} ₺` : '-';
    case 'INCLUDED':
      return 'Dahil';
    case 'NOT_INCLUDED':
      return 'Dahil Değil';
    case 'MARKET_VALUE':
      return 'Piyasa Değeri';
    case 'DEFINED':
      return 'Tanımlı';
    default:
      return value?.toString() || '-';
  }
};

export default coverageTooltips;
