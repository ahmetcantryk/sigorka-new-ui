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
    // Ana Teminatlar
    maddiHasarAracBasina: {
      label: "Maddi Hasar Araç Başına",
      tooltip: "Tek bir araca verilen maddi zarar için ödenecek tazminat limitini belirtir."
    },
    maddiHasarKazaBasina: {
      label: "Maddi Hasar Kaza Başına",
      tooltip: "Kazaya karışan tüm araçlara verilen toplam maddi zarar için ödenecek üst limitidir."
    },
    sakatlanmaVeOlumKisiBasina: {
      label: "Sakatlanma ve Ölüm Kişi Başına",
      tooltip: "Kaza sonucu her bir kişi için sakatlık veya ölüm halinde ödenecek tazminat tutarını ifade eder."
    },
    sakatlanmaVeOlumKazaBasina: {
      label: "Sakatlanma ve Ölüm Kaza Başına",
      tooltip: "Kaza sonucu oluşan toplam sakatlık ve ölüm zararları için ödenecek en yüksek tazminat tutarıdır."
    },
    tedaviSaglikGiderleriKisiBasina: {
      label: "Tedavi Sağlık Giderleri Kişi Başına",
      tooltip: "Kaza sonrası her bir kişinin tedavi giderleri için ödenecek teminat tutarını gösterir."
    },
    tedaviSaglikGiderleriKazaBasina: {
      label: "Tedavi Sağlık Giderleri Kaza Başına",
      tooltip: "Kaza sonrası oluşan toplam tedavi giderleri için ödenecek maksimum teminat tutarıdır."
    },
    
    // Ek Teminatlar
    hukuksalKorumaAracaBagli: {
      label: "Hukuksal Koruma",
      tooltip: "Kaza ile ilgili hukuki süreçlerde avukat ve mahkeme masraflarını karşılar."
    },
    hukuksalKorumaSurucuyeBagli: {
      label: "Hukuksal Koruma Sürücüye Bağlı",
      tooltip: "Sürücünün hukuki sorumluluğundan kaynaklanan davalarda koruma ve masraf desteği sağlar."
    },
    immKombine: {
      label: "İMM",
      tooltip: "Zorunlu trafik sigortası limitlerini aşan karşı tarafa verilen maddi & bedeni zararları ek güvence altına alır."
    },
    imm: {
      label: "İMM (İhtiyari Mali Mesuliyet)",
      tooltip: "Zorunlu trafik sigortası limitlerini aşan karşı tarafa verilen maddi & bedeni zararları ek güvence altına alır."
    },
    ferdiKaza: {
      label: "Ferdi Kaza",
      tooltip: "Kaza sonucu oluşan kalıcı sakatlık veya vefat durumunda sigortalıya/ailesine tazminat ödemesi yapar."
    },
    acilSaglik: {
      label: "Acil Sağlık",
      tooltip: "Kaza sonrası acil sağlık müdahale ve ilk tedavi masraflarını limitler dahilinde karşılar."
    },
    cekiciHizmeti: {
      label: "Yol Yardım",
      tooltip: "Aracın yolculuk sırasında arızalanması veya kaza yapması durumunda çekici, kurtarma ve acil destek hizmetleri sağlar."
    },
    aracBakimPlani: {
      label: "Araç Bakım Planı",
      tooltip: "Aracın isteğe bağlı bakım ve kontrol için gerekli organizasyon sunar."
    }
  },

  // DASK (Zorunlu Deprem Sigortası) Teminatları
  dask: {
    depremBina: {
      label: "Deprem Bina",
      tooltip: "Binanın deprem ve deprem sonucu oluşan yer sarsıntısı nedeniyle gördüğü fiziksel hasarların teminat kapsamında olup olmadığı."
    },
    depremYangin: {
      label: "Deprem Yangın",
      tooltip: "Deprem sonrasında meydana gelen yangın nedeniyle oluşan maddi hasarların poliçe tarafından karşılanıp karşılanmadığı."
    },
    depremInfilak: {
      label: "Deprem İnfilak",
      tooltip: "Deprem sebebiyle meydana gelen patlama (infilak) sonucu oluşan zararların teminat altında olup olmadığı."
    },
    depremTsunami: {
      label: "Deprem Tsunami",
      tooltip: "Deprem kaynaklı tsunami dalgalarının neden olduğu hasarların teminat kapsamında olup olmadığı."
    },
    depremYerKaymasi: {
      label: "Deprem Yer Kayması",
      tooltip: "Deprem sonucu oluşan yer kayması ve heyelan nedeniyle binada meydana gelen hasarların teminat altında olup olmadığı."
    }
  },

  // İMM (İhtiyari Mali Mesuliyet) Teminatları
  imm: {
    // Ana Teminatlar
    immLimiti: {
      label: "İMM Limiti",
      tooltip: "Zorunlu trafik sigortası limitlerini aşan, üçüncü kişilere verilen maddi ve bedeni zararları ek güvence altına alır."
    },
    hukukiKorumaAraca: {
      label: "Hukuki Koruma (Araca Bağlı)",
      tooltip: "Araç ile ilgili hukuki uyuşmazlıklarda avukatlık ve mahkeme masrafları teminat altındadır."
    },
    hukukiKorumaSurucu: {
      label: "Hukuki Koruma (Sürücüye Bağlı)",
      tooltip: "Sürücünün kişisel hukuki uyuşmazlıkları kapsamında hukuki danışmanlık ve masraflar karşılanır."
    },
    yetkiliOlmayanCektirme: {
      label: "Yetkili Olmayan Kişilere Çektirme",
      tooltip: "Aracın sigorta şirketi veya resmi kurumlarca yetkilendirilmemiş çekicilerle çekilmesi durumunda çekici, taşıma ve bu işlemden kaynaklanan maddi zararları teminat altına alır."
    }
  },

  // KONUT Teminatları
  konut: {
    camKirilmasi: {
      label: "Cam Kırılması",
      tooltip: "Evdeki pencere, balkon ve benzeri cam yüzeylerin kırılması sonucu oluşan maddi hasarları karşılar."
    },
    elektronikCihaz: {
      label: "Elektronik Cihaz",
      tooltip: "Evde bulunan TV, bilgisayar, beyaz eşya gibi elektronik cihazların ani ve beklenmedik arızaları veya hasarları için güvence sağlar."
    },
    tesisatVeElektrikArizalari: {
      label: "Tesisat ve Elektrik Arızaları",
      tooltip: "Evin içindeki su, elektrik ve benzeri tesisatlarda ani ve beklenmedik arızalar için onarım hizmeti ve oluşan hasarların giderilmesini teminat altına alır."
    },
    cilingirHizmetleri: {
      label: "Çilingir Hizmetleri",
      tooltip: "Anahtar kaybı, kilit arızası veya kapıda kalma durumlarında 7/24 çilingir hizmeti sunar."
    },
    binaYanginYildirimInfilak: {
      label: "Bina Yangın Yıldırım İnfilak",
      tooltip: "Binanın kendisinde yangın, yıldırım ve infilak sonucu oluşan yapısal hasarları karşılar."
    },
    yanginMaliMesuliyet: {
      label: "Yangın Mali Mesuliyet",
      tooltip: "Evinizde çıkan yangının komşu dairelerde veya üçüncü kişilere verdiği maddi zararları teminat altına alır."
    },
    firtina: {
      label: "Fırtına",
      tooltip: "Fırtına, hortum gibi şiddetli hava olayları nedeniyle çatı, dış cephe ve benzeri bölümlerde oluşan hasarları karşılar."
    },
    karAgirligi: {
      label: "Kar Ağırlığı",
      tooltip: "Yoğun kar birikmesi sonucu çatı ve benzeri yapı elemanlarında oluşan çökme ve hasarları teminat altına alır."
    },
    duman: {
      label: "Duman",
      tooltip: "Bacadan veya ani ve beklenmedik bir olaydan kaynaklanan dumanın evde oluşturduğu is ve diğer hasarları karşılar."
    },
    yerKaymasi: {
      label: "Yer Kayması",
      tooltip: "Heyelan ve toprak kayması sonucu konutta ve teminat altındaki eşyalarda oluşan maddi hasarları güvence altına alır."
    },
    dolu: {
      label: "Dolu",
      tooltip: "Dolu yağışı nedeniyle çatı, dış cephe, cam ve benzeri yüzeylerde oluşan hasarları karşılar."
    },
    dahiliSu: {
      label: "Dahili Su",
      tooltip: "Teminat altındaki temiz su tesisatının patlaması, sızması veya tıkanması sonucu evde oluşan su hasarlarını karşılar."
    },
    karaVeHavaTasitlariCarpmasi: {
      label: "Kara ve Hava Taşıtları Çarpması",
      tooltip: "Kara veya hava taşıtlarının binaya çarpması sonucu oluşan yapısal hasarları teminat altına alır."
    },
    enkazKaldirmaMasraflari: {
      label: "Enkaz Kaldırma Masrafları",
      tooltip: "Hasar sonrası oluşan enkazın kaldırılması ve taşınması için gerekli makul masrafları karşılar."
    },
    ferdiKaza: {
      label: "Ferdi Kaza",
      tooltip: "Konutta yaşayan sigortalı ve aile bireylerinin kaza sonucu vefat veya kalıcı sakatlık durumlarında tazminat ödemesi sağlar."
    },
    hukuksalKoruma: {
      label: "Hukuksal Koruma",
      tooltip: "Sigortalı konutla ilgili uyuşmazlıklarda avukatlık, dava ve mahkeme giderleri için hukuki destek sunar."
    },
    selSuBaskini: {
      label: "Sel Su Baskını",
      tooltip: "Sel, su baskını ve taşkın sonucu evde ve teminat altındaki eşyalarda oluşan hasarları teminat altına alır."
    },
    hirsizlik: {
      label: "Eşya",
      tooltip: "Evde zorla giriş veya hırsızlık sonucu çalınan eşyalar ve oluşan hasarları teminat altına alır."
    },
    kiraKaybi: {
      label: "Kira Kaybı",
      tooltip: "Evin hasar nedeniyle kullanılamaması durumunda, sigortalının kaybettiği kira gelirini veya ödediği kirayı belirlenen limitler dahilinde karşılar."
    },
    ikametgahDegisikligiMasraflari: {
      label: "İkametgah Değişikliği Masrafları",
      tooltip: "Hasar sonrası evin kullanılamaz hale gelmesi nedeniyle geçici olarak başka bir adrese taşınma, nakliye ve benzeri masrafları teminat altına alır."
    },
    izolasyon: {
      label: "İzolasyon",
      tooltip: "Çatı, dış cephe veya ıslak hacimlerdeki izolasyon problemlerine bağlı su sızıntısı ve nemin yol açtığı hasarları belirlenen kapsam dahilinde karşılar."
    },
    kombiVeKlimaBakimi: {
      label: "Kombi ve Klima Bakımı",
      tooltip: "Kombi veya klima cihazları için bakım hizmeti sunar."
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
  },

  // TSS (Tamamlayıcı Sağlık Sigortası) Teminatları
  tss: {
    hastaneAgi: {
      label: "Hastane Ağı",
      tooltip: "Sigortanın geçerli olduğu anlaşmalı özel hastaneleri ve sağlık kuruluşlarını ifade eder."
    },
    yatarakTedavi: {
      label: "Yatarak Tedavi",
      tooltip: "Hastanede yatış gerektiren ameliyat, operasyon, yoğun bakım ve yatarak tedavi giderlerini karşılar."
    },
    ayaktaTedavi: {
      label: "Ayakta Tedavi",
      tooltip: "Muayene, tetkik, tahlil, görüntüleme ve reçeteli tedavi gibi yatış gerektirmeyen sağlık hizmetlerini limitler dahilinde kapsar."
    },
    doktorMuayene: {
      label: "Doktor Muayene",
      tooltip: "Doktor muayene ve konsültasyon hizmetlerini kapsar."
    },
    yediGun24SaatTibbiDanismanlik: {
      label: "7/24 Tıbbi Danışmanlık",
      tooltip: "Mobil veya dijital platform üzerinden ek bir ücret ödemeden görüntülü doktor görüşmesi ve tıbbi danışmanlık hizmeti sağlar."
    },
    checkUpHizmeti: {
      label: "Check-up",
      tooltip: "Genel sağlık durumunu kapsamlı tarama ve kontrol paketini ek bir ücret ödemeden teminat altına alır."
    },
    disPaketi: {
      label: "Diş Sağlığı",
      tooltip: "Diş muayenesi, temizlik, dolgu gibi belirlenen dental tedavi ve hizmetleri ücretsiz olarak sağlar."
    },
    yogunBakim: {
      label: "Yoğun Bakım",
      tooltip: "Yoğun bakım ünitesinde yapılan tedavi giderlerini karşılar."
    },
    ameliyat: {
      label: "Ameliyat",
      tooltip: "Cerrahi müdahale gerektiren ameliyat giderlerini karşılar."
    },
    ameliyatMalzeme: {
      label: "Ameliyat Malzeme",
      tooltip: "Ameliyat sırasında kullanılan tıbbi malzeme giderlerini karşılar."
    },
    kemoterapi: {
      label: "Kemoterapi",
      tooltip: "Kanser tedavisinde uygulanan kemoterapi giderlerini karşılar."
    },
    radyoterapi: {
      label: "Radyoterapi",
      tooltip: "Kanser tedavisinde uygulanan radyoterapi giderlerini karşılar."
    },
    diyaliz: {
      label: "Diyaliz",
      tooltip: "Böbrek yetmezliği tedavisinde uygulanan diyaliz giderlerini karşılar."
    },
    evdeBakim: {
      label: "Evde Bakım",
      tooltip: "Hastane sonrası evde bakım ve tedavi giderlerini karşılar."
    },
    dogum: {
      label: "Doğum",
      tooltip: "Doğum ve hamilelik sürecindeki sağlık giderlerini karşılar."
    },
    kucukMudahale: {
      label: "Küçük Müdahale",
      tooltip: "Ameliyat gerektirmeyen küçük cerrahi müdahale giderlerini karşılar."
    },
    fizikTedavi: {
      label: "Fizik Tedavi",
      tooltip: "Fizik tedavi ve rehabilitasyon giderlerini karşılar."
    },
    suniUzuv: {
      label: "Suni Uzuv",
      tooltip: "Protez ve suni uzuv giderlerini karşılar."
    },
    ambulans: {
      label: "Ambulans",
      tooltip: "Acil durumlarda ambulans hizmeti giderlerini karşılar."
    },
    diyetisyenHizmeti: {
      label: "Diyetisyen Hizmeti",
      tooltip: "Diyetisyen danışmanlık hizmeti giderlerini karşılar."
    },
    psikolojikDanismanlik: {
      label: "Psikolojik Danışmanlık",
      tooltip: "Psikolojik danışmanlık ve terapi hizmeti giderlerini karşılar."
    },
    gozPaketi: {
      label: "Göz Paketi",
      tooltip: "Göz muayenesi ve tedavi giderlerini karşılar."
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
 * Her key için alternatif label'lar ve config key'leri tanımlanır
 */
const labelMapping: Record<string, string[]> = {
  // DASK teminatları
  'Deprem Bina': ['Deprem Bina', 'depremBina'],
  'depremBina': ['Deprem Bina'],
  'Deprem Yangın': ['Deprem Yangın', 'depremYangin'],
  'depremYangin': ['Deprem Yangın'],
  'Deprem İnfilak': ['Deprem İnfilak', 'depremInfilak'],
  'depremInfilak': ['Deprem İnfilak'],
  'Deprem Tsunami': ['Deprem Tsunami', 'depremTsunami'],
  'depremTsunami': ['Deprem Tsunami'],
  'Deprem Yer Kayması': ['Deprem Yer Kayması', 'depremYerKaymasi'],
  'depremYerKaymasi': ['Deprem Yer Kayması'],
  
  // İMM teminatları
  'İMM Limiti': ['İMM Limiti', 'immLimiti'],
  'immLimiti': ['İMM Limiti'],
  'Hukuki Koruma (Araca Bağlı)': ['Hukuki Koruma (Araca Bağlı)', 'hukukiKorumaAraca', 'Hukuksal Koruma Araca Bağlı'],
  'hukukiKorumaAraca': ['Hukuki Koruma (Araca Bağlı)', 'Hukuksal Koruma Araca Bağlı'],
  'Hukuki Koruma (Sürücüye Bağlı)': ['Hukuki Koruma (Sürücüye Bağlı)', 'hukukiKorumaSurucu', 'Hukuksal Koruma Sürücüye Bağlı'],
  'hukukiKorumaSurucu': ['Hukuki Koruma (Sürücüye Bağlı)', 'Hukuksal Koruma Sürücüye Bağlı'],
  'Yetkili Olmayan Kişilere Çektirme': ['Yetkili Olmayan Kişilere Çektirme', 'yetkiliOlmayanCektirme'],
  'yetkiliOlmayanCektirme': ['Yetkili Olmayan Kişilere Çektirme'],
  
  // Kasko teminatları
  'Cam': ['Cam Kırılma Muafiyeti', 'camKirilmaMuafeyeti'],
  'Servis': ['Onarım Servis Türü', 'onarimServisTuru'],
  'İkame Araç': ['Kiralık Araç', 'kiralikArac'],
  'Cam Kırılma Muafiyeti': ['Cam', 'camKirilmaMuafeyeti'],
  'Onarım Servis Türü': ['Servis', 'onarimServisTuru'],
  'Kiralık Araç': ['İkame Araç', 'kiralikArac'],
  
  // Trafik - İMM
  'İMM': ['İMM', 'İMM (İhtiyari Mali Mesuliyet)', 'İMM Kombine', 'immKombine', 'imm'],
  'İMM (İhtiyari Mali Mesuliyet)': ['İMM', 'İMM Kombine', 'immKombine', 'imm'],
  'İMM Kombine': ['İMM', 'İMM (İhtiyari Mali Mesuliyet)', 'immKombine', 'imm'],
  'immKombine': ['İMM', 'İMM (İhtiyari Mali Mesuliyet)', 'İMM Kombine', 'imm'],
  'imm': ['İMM', 'İMM (İhtiyari Mali Mesuliyet)', 'İMM Kombine', 'immKombine'],
  
  // Trafik - Yol Yardım / Çekici
  'Yol Yardım': ['Yol Yardım', 'Çekici Hizmeti', 'cekiciHizmeti'],
  'Çekici Hizmeti': ['Yol Yardım', 'cekiciHizmeti'],
  'cekiciHizmeti': ['Yol Yardım', 'Çekici Hizmeti'],
  
  // Trafik - Hukuksal Koruma
  'Hukuksal Koruma': ['Hukuksal Koruma', 'Hukuksal Koruma Araca Bağlı', 'hukuksalKorumaAracaBagli'],
  'Hukuksal Koruma Araca Bağlı': ['Hukuksal Koruma', 'hukuksalKorumaAracaBagli'],
  'hukuksalKorumaAracaBagli': ['Hukuksal Koruma', 'Hukuksal Koruma Araca Bağlı'],
  'Hukuksal Koruma Sürücüye Bağlı': ['Hukuksal Koruma Sürücüye Bağlı', 'hukuksalKorumaSurucuyeBagli'],
  'hukuksalKorumaSurucuyeBagli': ['Hukuksal Koruma Sürücüye Bağlı'],
  
  // Trafik - Diğer ek teminatlar
  'Ferdi Kaza': ['Ferdi Kaza', 'ferdiKaza'],
  'ferdiKaza': ['Ferdi Kaza'],
  'Acil Sağlık': ['Acil Sağlık', 'acilSaglik'],
  'acilSaglik': ['Acil Sağlık'],
  'Araç Bakım Planı': ['Araç Bakım Planı', 'aracBakimPlani'],
  'aracBakimPlani': ['Araç Bakım Planı'],
  
  // Trafik - Zorunlu Ana Teminatlar (6'lı grup)
  'Maddi Hasar Araç Başına': ['Maddi Hasar Araç Başına', 'maddiHasarAracBasina'],
  'maddiHasarAracBasina': ['Maddi Hasar Araç Başına'],
  'Maddi Hasar Kaza Başına': ['Maddi Hasar Kaza Başına', 'maddiHasarKazaBasina'],
  'maddiHasarKazaBasina': ['Maddi Hasar Kaza Başına'],
  'Sakatlanma ve Ölüm Kişi Başına': ['Sakatlanma ve Ölüm Kişi Başına', 'sakatlanmaVeOlumKisiBasina'],
  'sakatlanmaVeOlumKisiBasina': ['Sakatlanma ve Ölüm Kişi Başına'],
  'Sakatlanma ve Ölüm Kaza Başına': ['Sakatlanma ve Ölüm Kaza Başına', 'sakatlanmaVeOlumKazaBasina'],
  'sakatlanmaVeOlumKazaBasina': ['Sakatlanma ve Ölüm Kaza Başına'],
  'Tedavi Sağlık Giderleri Kişi Başına': ['Tedavi Sağlık Giderleri Kişi Başına', 'tedaviSaglikGiderleriKisiBasina'],
  'tedaviSaglikGiderleriKisiBasina': ['Tedavi Sağlık Giderleri Kişi Başına'],
  'Tedavi Sağlık Giderleri Kaza Başına': ['Tedavi Sağlık Giderleri Kaza Başına', 'tedaviSaglikGiderleriKazaBasina'],
  'tedaviSaglikGiderleriKazaBasina': ['Tedavi Sağlık Giderleri Kaza Başına'],
};

/**
 * Belirli bir branş ve teminat için tooltip bilgisini döndürür
 * Boş string ise null döner (tooltip gösterilmez)
 * Önce coverageKey ile, bulamazsa label ile eşleştirme yapar
 */
export const getCoverageTooltip = (branch: string, coverageKey: string): string | null => {
  const branchConfig = coverageTooltips[branch.toLowerCase()];
  if (!branchConfig) return null;
  
  // 1. Önce direkt key ile ara (config'deki key ile tam eşleşme)
  let coverage: { label: string; tooltip: string } | undefined = branchConfig[coverageKey];
  
  // 2. Bulamazsa label mapping ile ara
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
  
  // 3. Bulamazsa label ile ara (tam eşleşme)
  if (!coverage) {
    coverage = Object.values(branchConfig).find(
      (item) => item.label === coverageKey || item.label.toLowerCase() === coverageKey.toLowerCase()
    );
  }
  
  // 4. Bulamazsa config key'lerini kontrol et (key'in kendisi coverageKey ile eşleşiyor mu)
  if (!coverage) {
    const configEntry = Object.entries(branchConfig).find(
      ([key, _]) => key.toLowerCase() === coverageKey.toLowerCase()
    );
    if (configEntry) {
      coverage = configEntry[1];
    }
  }
  
  // 5. Hala bulamazsa normalize edilmiş label ile ara
  if (!coverage) {
    const normalizedKey = normalizeLabel(coverageKey);
    coverage = Object.values(branchConfig).find(
      (item) => normalizeLabel(item.label) === normalizedKey
    );
  }
  
  // 6. Hala bulamazsa benzer label ile ara (kelime bazlı eşleştirme)
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
