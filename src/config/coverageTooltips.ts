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
      tooltip: ""
    },
    ferdiKazaVefat: {
      label: "Ferdi Kaza - Vefat",
      tooltip: ""
    },
    ferdiKazaSakatlik: {
      label: "Ferdi Kaza - Sakatlık",
      tooltip: ""
    },
    ferdiKazaTedaviMasraflari: {
      label: "Ferdi Kaza - Tedavi Masrafları",
      tooltip: ""
    },

    // Anahtar ve Hırsızlık
    anahtarKaybi: {
      label: "Anahtar Kaybı",
      tooltip: ""
    },
    aracCalinmasi: {
      label: "Araç Çalınması",
      tooltip: "Araç çalınması durumunda, araç başına 300 bin TL'lik üst limite kadar koruma sağlar."
    },
    anahtarCalinmasi: {
      label: "Anahtar Çalınması",
      tooltip: ""
    },
    hirsizlik: {
      label: "Hırsızlık",
      tooltip: ""
    },

    // Onarım ve Servis
    onarimServisTuru: {
      label: "Onarım Servis Türü",
      tooltip: ""
    },
    yedekParcaTuru: {
      label: "Yedek Parça Türü",
      tooltip: ""
    },
    miniOnarim: {
      label: "Mini Onarım",
      tooltip: ""
    },

    // Cam ve Muafiyet
    camKirilmaMuafeyeti: {
      label: "Cam Kırılma Muafiyeti",
      tooltip: "Kaza durumunda, Zorunlu Trafik Sigortası karşı tarafta oluşan hasarda araç başına 300 bin TL, kaza başına toplam 600 bin TL'lik üst limite kadar koruma sağlar."
    },

    // Kiralık Araç
    kiralikArac: {
      label: "Kiralık Araç",
      tooltip: ""
    },

    // Hukuki Koruma
    hukuksalKorumaAracaBagli: {
      label: "Hukuksal Koruma (Araca Bağlı)",
      tooltip: ""
    },
    hukuksalKorumaSurucuyeBagli: {
      label: "Hukuksal Koruma (Sürücüye Bağlı)",
      tooltip: ""
    },

    // Özel Eşya ve Zarar
    ozelEsya: {
      label: "Özel Eşya",
      tooltip: ""
    },
    maneviTazminat: {
      label: "Manevi Tazminat",
      tooltip: ""
    },
    // Çeşitli Zararlar
    sigaraMaddeZarari: {
      label: "Sigara/Madde Zararı",
      tooltip: ""
    },
    patlayiciMaddeZarari: {
      label: "Patlayıcı Madde Zararı",
      tooltip: ""
    },
    kemirgenZarari: {
      label: "Kemirgen Zararı",
      tooltip: ""
    },
    yukKaymasiZarari: {
      label: "Yük Kayması Zararı",
      tooltip: ""
    },
    eskime: {
      label: "Eskime Payı",
      tooltip: ""
    },

    // Özel Durumlar
    hasarsizlikIndirimKoruma: {
      label: "Hasarsızlık İndirimi Koruma",
      tooltip: ""
    },
    yurtdisiKasko: {
      label: "Yurtdışı Kasko",
      tooltip: ""
    },
    yolYardim: {
      label: "Yol Yardım",
      tooltip: "Aracınız arıza yaptığında, kaza geçirdiğinizde veya yolda kaldığınızda çekici, lastik değişimi, akü takviyesi, yakıt temini gibi acil yardım hizmetleri sunulur. Hizmetin kapsamı ve limitleri poliçenizde belirtildiği şekilde değişiklik gösterebilir."
    },
    yanlisAkaryakitDolumu: {
      label: "Yanlış Akaryakıt Dolumu",
      tooltip: ""
    },

    // Temel Teminatlar
    yanma: {
      label: "Yanma",
      tooltip: "Araç yangını, patlaması veya yanması durumunda, araç başına 300 bin TL'lik üst limite kadar koruma sağlar."
    },
    carpma: {
      label: "Çarpma",
      tooltip: ""
    },
    carpisma: {
      label: "Çarpışma",
      tooltip: ""
    },

    // Doğal Afetler ve Terör
    glkhhTeror: {
      label: "GLKHH - Terör",
      tooltip: ""
    },
    grevLokavt: {
      label: "Grev/Lokavt",
      tooltip: ""
    },
    dogalAfetler: {
      label: "Doğal Afetler",
      tooltip: ""
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
 * Belirli bir branş ve teminat için tooltip bilgisini döndürür
 * Boş string ise null döner (tooltip gösterilmez)
 * Önce coverageKey ile, bulamazsa label ile eşleştirme yapar
 */
export const getCoverageTooltip = (branch: string, coverageKey: string): string | null => {
  const branchConfig = coverageTooltips[branch.toLowerCase()];
  if (!branchConfig) return null;
  
  // Önce direkt key ile ara
  let coverage: { label: string; tooltip: string } | undefined = branchConfig[coverageKey];
  
  // Bulamazsa label ile ara
  if (!coverage) {
    coverage = Object.values(branchConfig).find(
      (item) => item.label === coverageKey || item.label.toLowerCase() === coverageKey.toLowerCase()
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
