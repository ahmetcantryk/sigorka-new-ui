'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
const FAQ = () => {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const faqItems = [
    {
      id: 1,
      title: "Katılım Sigortacılık Sistemi Nasıl İşler?",
      content: `Geleneksel sigortacılıkta sigortalı ile sigortacı arasında karşılıklı sorumluluklar yükleyen bir akit söz konusudur. Sigortalı primini ödeyecek sigortacı da poliçe şartları çerçevesinde gerektiğinde tazminat ödeyecektir. Toplanan primler tazminatlara yetmez ise sigortacı zarar etmiş olmaktadır. Buna karşın toplanan primler ödenen tazminatlardan fazla ise sigortacının karıdır. Sigorta döneminde riziko gerçekleşmez ise sigortalının ödediği prim tamamen sigortacının olmaktadır. Katılım sistemin de ise geleneksel sigortaların aksine toplanan primler Katılım kuruluşunun sigortalılara vekaleten faizsizlik esasına uygun olarak işletmesi amacıyla bir fonda toplanmakta ve gerektiğinde sigortalıların birbirlerine bağış olarak alınmaktadır. Bu havuzda biriken meblağ Katılım kuruluşu tarafından faizsizlik esasına göre işletilmekte ve Katılım kuruluşunun vekalet ya da ortaklık gibi doğal haklarının dışındaki kar sigortalıların primlerinden oluşan havuza aktarılmaktadır. Bu havuz ayrıca sigortanın gereği olarak hasar gerçekleşmesi halinde mağdur olan poliçe sahibinin mağduriyetini gidermede kullanılmaktadır.`
    },
    {
      id: 2,
      title: "Katılım Anlaşması Ticari midir?",
      content: `İsminden de anlaşılacağı üzere katılım, karşılıklı dayanışma esaslıdır. Bu sistemde sigortalıların kendi aralarındaki ilişki ortaklık, yardımlaşma ve dayanışmadır. Primleriyle oluşturdukları havuz, Katılım kuruluşunun işletmesi ile kar eder ise başlangıçta Katılım kuruluşuyla yaptıkları sözleşme hükümlerine uygun olarak karda ortaklıkları söz konudur. Sigortalılar ile Katılım kuruluşu arasındaki ilişki ise sigortalıların sigortadan arzu ettikleri bütün teminatları sağlamakla birlikte klasik sigortacı sigortalı ilişkisinden öte sigortalıların fonunu onlara vekaleten işleten vekil müvekkil ilişkisidir. Klasik sigortada ise ticari faaliyet esastır. Sigortacı topladığı primler ile ödediği tazminatlar arasındaki farkı kendisine kar olarak alır. Katılım sigortasında karşılıklı dayanışma esastır ve amaç kar değildir.`
    },
    {
      id: 3,
      title: "Katılım Fonu ile Sermayedarlar Fonu Arasındaki İlişki Nasıldır?",
      content: `Katılım sisteminde katılım katılımcılarından (sigortalılar) toplanan fon ile sermayedarların hesapları arasında tam bir ayrım vardır. Katılım fonu Katılım kuruluşunun mülkiyetine geçmez. katılım fonu katılımcılarına vekaleten işletmesi ve sözleşmede belirlenen rizikoya maruz kalan katılımcılara tazminat ödemelerini organize etmesi amacıyla Katılım kuruluşuna emanet edilmiştir. Halbuki klasik sigortada bütün primler ile bu primlerden sağlanan karlar sermayedarlara aittir.`
    },
    {
      id: 4,
      title: "Ödenen Hasar Tutarları Katılım Havuzunu Aşarsa Ne Olur?",
      content: `Katılım sisteminde katılımcıların ödediği katılım fonları ödenen tazminatları karşılamaz ise katılım fonunu yöneten katılım kuruluşu (vekil) katılımcıların oluşturduğu Katılım fonuna faizsiz borç (karz-ı hasen) verir. Yani katılım sistemine katılımcıların ödediği fon toplam sigorta ödemelerini karşılayamaz ise Katılım Kuruluşu hiçbir faiz almadan katılım fonuna borç verir ve katılımcıların hak ettikleri tazminatları öder. Bu faizsiz borç fonun daha sonraki gelirlerinden tahsil edilir. Klasik sigortacılıkta ise şirketlerin topladıkları primler toplam tazminat ödemelerini karşılayamayacak duruma düşerse zarar şirkete aittir.`
    },
    {
      id: 5,
      title: "Katılım Sistemi Faiz İçeriyor mu?",
      content: `Klasik sigortayla ilgili en önemli eleştirilerden biri söz konusu sigortacılık işleminin faiz içerdiğidir. Zira klasik sigorta şirketleri topladıkları primi neredeyse bütünüyle faizli işlemlerde değerlendirirler. Sigortalıya ödedikleri tazminatları da faizli işlemlerden kazandıkları fonlarla karşılarlar. Yine sigortacının sigortalıdan aldığı ve mülkiyetine geçirdiği prime mukabil riziko gerçekleşmesi halinde sigortalıya primden kat kat fazla tazminat ödemeyi garanti etmesi de kimi İslam alimlerince faizli işlem addedilmiştir. Katılım sisteminde katılımcıların katkılarıyla oluşan fon faizsiz enstrümanlarda değerlendirilir. Bu bakımdan fonun karı faizden değil kar ya da kira gibi faiz dışı gelirlerden oluşur. Katımcıya ödenen tazminatlar da bu fondan karşılandığından sigortalıya faiz ödemesi yapılmamış olur. Yine katılım sisteminde katılım Kuruluşu sigorta primi karşılığında sigortalıya tazminat ödemeyi garanti eden taraf değil katılımcıların ödedikleri katkı paylarından oluşan Katılım fonunu işleten vekildir. Dolayısıyla prim karşılığı ödenen tazminat arasındaki fark faiz olarak değerlendirilemez. Katılımcıların katılım kuruluşuna emanet ettikleri katkı payları ile rizikoya maruz kalan katılımcıya yaptıkları bağış niteliğindedir.`
    },
    {
      id: 6,
      title: "Katılım Sigortacılığında Fonlar Nerelerde Değerlendirilir?",
      content: `Katılım sisteminde katılım kuruluşu toplanan fonu faizsiz işlemlerde değerlendirmek zorundadır. Fonun değerlendirileceği işlemin faizsiz olup olmadığına katılım kuruluşu bünyesinde bulunan danışma kurulu karar verir. Buna göre kuruluş, faiz yerine kar ve kira gibi gelirler elde etmek üzere faaliyette bulunur. Dolayısıyla katılımcıların katkı paylarıyla oluşan fon katılım bankalarının özel cari ve katılma hesaplarıyla, altın ve döviz alım satımı, kıymetli maden alım satımı, emtia alım satımı, katılım endeksine tabi hisse senetlerinin alım satımı, proje ortaklıkları, hazine ve özel sektör kira sertifikalarında değerlendirilebilir.`
    },
    {
      id: 7,
      title: "Sigorta Yaptırmak Kadere Karşı Çıkmak Mıdır?",
      content: `Kader insanoğlunun yaşayacaklarının Allah Teala tarafından bilinmesi ve kendi katında yazılı olmasıdır. Buna karşın insanoğlu acziyeti sebebiyle kaderinin nasıl olduğunu bilemez. Ona düşen çalışması, görevlerini yerine getirmesi ve risklere karşı önlemini almasıdır. Sigorta da yaşanacak rizikolar sebebiyle düşülecek zor durumlara karşı bir nevi tedbirdir. Sigorta tek başına yüklenilmesi zor bir riski benzer riske maruz olanlar arasında paylaştırmaktır. Bu ise kadere razı olmamak olarak değerlendirilemeyeceği gibi bilakis yardımlaşma kapsamında övgüye layıktır.`
    },
    {
      id: 8,
      title: "Katılım Sigortacılığında Sigorta Primi Ne Anlama Gelir?",
      content: `Sigortalıların ödediği primler, onların fonlarıyla oluşturulan bir havuza katkı anlamı taşır. Bu fon, katılım kuruluşu tarafından faizsizlik esasına göre işletilir. Bu fon, aynı zamanda katılımcıların yaşadıkları rizikolar için sigortalıların birbirlerine bağışı mahiyetindedir.`
    },
    {
      id: 9,
      title: "Katılım Sigortacılığında Hasar Gören Müşterinin Hasarı Nereden ve Nasıl Karşılanır?",
      content: `Sigortacılıkta sigortalıların maruz kaldıkları riziko sebebiyle aldıkları tazminatlar kısmen sigorta şirketi tarafından kısmen de sigortacının sigortacısı yani reasürans kuruluşunca karşılanır. Zira sigortacılar, maruz kalacakları rizikoyu dağıtmak üzere belirli bir prim karşılığı üst sigorta kuruluşlarına kendilerini sigortalatırlar. Klasik sigortada reasürans şirketleri de faizli işlemlerle fonlarını işletirler. Katılım sigortacılığı sisteminde ise sigortalılara ödenen tazminatlar, kısmen faizsizlik esasına göre işletmesi için katılım kuruluşuna emanet edilen fondan karşılanır. Klasik sigortadaki reasüransın yerini katılım sisteminde Re-Katılım (retekafül) alır. Buna göre katılım kuruluşu katılım fonunu bir üst katılım kuruluşuna sigortalatır. Reasürans kuruluşu da kendisine emanet edilen fonu faizsiz işlemlerde değerlendirmek durumundadır. İşte rizikoya maruz kalan sigortalıların aldığı tazminatların bir kısmı da bu re-katılım kuruluşlarınca karşılanır.`
    },
    {
      id: 10,
      title: "Katılım Sigortacılığında Vekalet Ücreti Nedir?",
      content: `İnsanlar bazı eylemlerde başkalarını kendileri namına işlem yapmaya yetkili kılabilirler. Buna vekalet denilir. Buna göre vekalet kişinin belli bir tasarrufta, başkasını kendi yerine koymasıdır. Katılım sigortacılığı sisteminde katılım kuruluşu katılımcıların katkı paylarıyla oluşturdukları fonu onlara vekaleten faizsizlik esasına göre işletir. Ayrıca sigortacılığın gereği olan işleri yapar. Vekalet ücretli ya da ücretsiz olabilir. Vekalet ücreti müvekkil ile yapılan sözleşme uyarınca maktu, oransal ya da prim şeklinde belirlenebilir. Bu esaslar çerçevesinde Katılım kuruluşunun fon yararına vekaleten yaptığı işlemler karşılığında katılımcıların bilgisine çeşitli yollarla sunulmuş bir vekalet ücreti alması hakkıdır.`
    },
    {
      id: 11,
      title: "Katılım Sigortacılığında Danışma Kurulu Nedir?",
      content: `Bir şirketin katılım şirketi olabilmesi için şirket bünyesinde faizsiz finans ve katılım sistemi hakkında uzmanlaşmış ilim adamlarından oluşan bir danışma kurulunun bulunması gerekir. Aksi takdirde bu şirketin katılım şirketi olması mümkün değildir. İslami ilimler alanında uzman ilim adamlarından oluşan danışma kurulu bir katılım şirketinin yapmış olduğu tüm anlaşmaları, hazırladığı poliçeleri, sigortaladığı varlıkları ve fonu işletme yöntemlerini faizsizlik esasına göre inceler ve uygun olmayan durumları engeller. Buna göre katılım sigortası sisteminde olması veya olmaması gereken hususlar danışma kurulu tarafından belirlenmekte ve denetlenmektedir. Yapılan tüm işlemler ve değişiklikler danışma kurulu onayı alındıktan sonra devreye alınmaktadır.`
    }
  ];

  const toggleItem = (id: number) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const getBodyHeight = (index: number) => {
    const ref = itemRefs.current[index];
    if (ref) {
      return ref.scrollHeight;
    }
    return 0;
  };

  return (
    <section className="faq">
      <div className="faq__container container">
        <h2 className="section-title">
          <span>Katılım Sigortacılığı Hakkında Sıkça Sorulan Sorular</span>
        </h2>
        <div className="faq-list mb-5">
          {faqItems.map((item, idx) => (
            <div key={item.id} className={`faq-list__item${activeItem === item.id ? ' faq-list__item--active' : ''}`}>
              <button 
                type="button"
                className={`faq-list__item-link${activeItem === item.id ? ' active' : ''}`} 
                onClick={() => toggleItem(item.id)}
              >
                <h3 className="faq-list__item-title">{item.title}</h3>
              </button>
              <div
                ref={el => { itemRefs.current[idx] = el; }}
                className={`faq-list__item-body${activeItem === item.id ? ' faq-list__item-body--open' : ''}`}
                style={{
                  height: activeItem === item.id ? getBodyHeight(idx) : 0,
                  opacity: activeItem === item.id ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s'
                }}
              >
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-center">
          <Link href="/sikca-sorulan-sorular" className="btn btn-secondary" target="_self">
            Tümünü Gör
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 