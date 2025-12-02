import BlogPromoSlider from '../components/blog/BlogPromoSlider';
import BlogClientArea from '../components/blog/BlogClientArea';
import '../../styles/main.min.css';
import '../../styles/subpage.min.css';
import '../../styles/armorbroker.css';
import { Metadata } from 'next';


interface Category {
  id: number;
  name: string;
  value?: string;
}

interface Blog {
  id?: number;
  title: string;
  date: string;
  slug?: string;
  content?: string;
  image?: string;
  imageUrl?: string; 
  summary?: string;
  categories?: { id: number; name: string; value: string }[];
  isPromo?: boolean; // Promo blog alanı
}

export const metadata: Metadata = {
  title: 'Sigorta Blogu - Güncel Haberler ve İpuçları | Sigorka',
  description: 'Sigortacılıkla ilgili güncel yazılar, ipuçları ve rehberler için blog sayfamızı ziyaret edin. Daha fazlası için sitemizi ziyaret ederek hizmetlere göz atın.',
  metadataBase: new URL('https://sigorka.com'),
  alternates: {
    canonical: "https://sigorka.com/blog"
  },
  openGraph: {
    title: 'Sigorta Blogu - Güncel Haberler ve İpuçları | Sigorka',
    description: 'Sigortacılıkla ilgili güncel yazılar, ipuçları ve rehberler için blog sayfamızı ziyaret edin. Daha fazlası için sitemizi ziyaret ederek hizmetlere göz atın.',
    url: 'https://sigorka.com/blog',
    type: 'website',
    images: [
      {
        url: 'https://sigorka.com/images/sigorka-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sigorka Blog'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sigorta Blogu - Güncel Haberler ve İpuçları | Sigorka',
    description: 'Sigortacılıkla ilgili güncel yazılar, ipuçları ve rehberler için blog sayfamızı ziyaret edin. Daha fazlası için sitemizi ziyaret ederek hizmetlere göz atın.',
    images: ['https://sigorka.com/images/sigorka-og-image.png']
  }
};

export default async function BlogPage() {
  // Statik import kullanarak JSON dosyasını getiriyoruz
  const blogs = (await import('../../../public/content/blogs.json')).default as Blog[];
  
  // Tarihe göre sıralayıp 
  const sorted = blogs.slice().sort((a: Blog, b: Blog) => {
    const aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const parseDate = (str: string) => {
      const [gun, ay, yil] = str.split(' ');
      const ayIndex = aylar.findIndex(a => a.toLowerCase() === ay.toLowerCase());
      if (ayIndex === -1 || isNaN(Number(gun)) || isNaN(Number(yil))) return 0;
      return new Date(Number(yil), ayIndex, Number(gun)).getTime();
    };
    return parseDate(b.date) - parseDate(a.date);
  });

  // Promo blogları: Tarihe göre son eklenen 3 blog
  const promoBlogs = sorted.slice(0, 3);
  
  // Sadece gerçekte var olan kategoriler (Python çıktısına göre)
  const categories = [
    { id: 1, name: 'Tüm Yazılar', value: '' },
    { id: 2, name: 'Katılım Sigortası', value: 'katilim-sigortasi' },
    { id: 3, name: 'Katılım Sağlık Sigortası', value: 'katilim-saglik-sigortasi' },
    { id: 4, name: 'Araç Sigortası', value: 'arac-sigortasi' },
    { id: 5, name: 'DASK', value: 'dask' },
    { id: 6, name: 'İMM Sigortası', value: 'imm-sigortasi' },
    { id: 7, name: 'Ferdi Kaza Sigortası', value: 'ferdi-kaza-sigortasi' },
    { id: 8, name: 'Yaşam', value: 'yasam' }
  ];
  return (
    <>
      <section className="cover cover--sm">
        <div className="container cover__container">
          <h1 className="cover__title-1">Bilgi Merkezi</h1>
          <h2 className="cover__title-2">Blog</h2>
        </div>
      </section>
      {/* Blog Promo Alanı - Server'dan veri ile */}
      {promoBlogs.length > 0 && (
        <section className="blog-promo mb-5">
          <div className="container container--sm">
            <BlogPromoSlider promoBlogs={promoBlogs.map(blog => ({
              id: blog.id || 0,
              title: blog.title,
              summary: blog.summary || blog.content?.slice(0, 100) || '',
              imageUrl: blog.imageUrl || blog.image || '/images/no-image.jpg',
              slug: blog.slug
            }))} />
          </div>
        </section>
      )}
      <section className="blog-section">
        <div className="container container--sm">
          <BlogClientArea blogs={sorted} categories={categories} />
        </div>
      </section>
    </>
  );
}