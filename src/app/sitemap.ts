import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { slugify } from './components/blog/slugify';

// Blog verilerini okuyan yardımcı fonksiyon
interface BlogPost {
  slug: string;
  lastModified: string;
}

interface BlogData {
  slug?: string;
  title: string;
  date: string;
}

// Türkçe tarih formatını ISO 8601 formatına çeviren fonksiyon
function convertTurkishDateToISO(turkishDate: string): string {
  const dateMap: { [key: string]: string } = {
    'Ocak': '01', 'Şubat': '02', 'Mart': '03', 'Nisan': '04',
    'Mayıs': '05', 'Haziran': '06', 'Temmuz': '07', 'Ağustos': '08',
    'Eylül': '09', 'Ekim': '10', 'Kasım': '11', 'Aralık': '12'
  };

  // "15 Eylül 2024" formatındaki tarihi parse et
  const parts = turkishDate.split(' ');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = dateMap[parts[1]];
    const year = parts[2];
    
    if (month && day && year) {
      // Tam ISO 8601 formatı için saat bilgisi ekle (00:00:00.000Z)
      return `${year}-${month}-${day}T00:00:00.000Z`;
    }
  }
  
  // Eğer parse edilemezse bugünün tarihini döndür
  return new Date().toISOString();
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const filePath = path.join(process.cwd(), 'public', 'content', 'blogs.json');
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const blogs = JSON.parse(fileContent) as BlogData[];
  
  return blogs.map((blog: BlogData) => ({
    slug: blog.slug || slugify(blog.title),
    lastModified: convertTurkishDateToISO(blog.date)
  }));
}

// Sözlük verilerini okuyan yardımcı fonksiyon
interface DictionaryTerm {
  slug: string;
}

interface DictionaryData {
  slug: string;
}

async function getDictionaryTerms(): Promise<DictionaryTerm[]> {
  const filePath = path.join(process.cwd(), 'src', 'app', 'sozluk', 'dictionary.json');
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const terms = JSON.parse(fileContent) as DictionaryData[];
  
  return terms.map((term: DictionaryData) => ({
    slug: term.slug
  }));
}

// Kampanya verilerini okuyan yardımcı fonksiyon
interface Campaign {
  slug: string;
}

interface CampaignData {
  slug: string;
}

async function getCampaigns(): Promise<Campaign[]> {
  const filePath = path.join(process.cwd(), 'public/kampanyalar.json');
  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  const campaigns = JSON.parse(fileContent) as CampaignData[];
  
  return campaigns.map((campaign: CampaignData) => ({
    slug: campaign.slug
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sigorka.com';
  const currentDate = new Date().toISOString();
  
  // Blog yazılarını al
  const blogPosts = await getBlogPosts();
  
  // Sözlük terimlerini al
  const dictionaryTerms = await getDictionaryTerms();
  
  // Kampanyaları al
  const campaigns = await getCampaigns();

  // Ana sayfalar
  const mainPages = [
    '',
    'aracim',
    'sagligim',
    'yuvam',
    'blog',
    'sikca-sorulan-sorular',
    'sozluk',
  ].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: currentDate,
    priority: route === '' ? 1 : 0.9,
  }));

  // Sigorta ürünleri
  const productPages = [
    'kasko-sigortasi',
    'zorunlu-trafik-sigortasi',
    'dask',
    'konut-sigortasi',
    'ozel-saglik-sigortasi',
    'tamamlayici-saglik-sigortasi',
    'yabanci-saglik-sigortasi',
    'seyahat-saglik-sigortasi',
    'ferdi-kaza-sigortasi',
    'imm',
    'acil-saglik-sigortasi',
    
  ].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: currentDate,
    priority: 0.8,
  }));

  // Kurumsal sayfalar
  const corporatePages = [
    'biz-kimiz',
    'neden-katilim-sigortaciligi',
    'anlasmali-sigorta-sirketleri',
    'iletisim',
    'kampanyalar',
  ].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: currentDate,
    priority: 0.7,
  }));

  // Yasal sayfalar
  const legalPages = [
    'kvkk',
    'cerez-politikasi',
    'kullanici-sozlesmesi',
    'mesafeli-satis-sozlesmesi',
    'elektronik-ileti-onayi',
    'acik-riza-metni',
  ].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: currentDate,
    priority: 0.5,
  }));

  // Blog detay sayfaları
  const blogDetailPages = blogPosts.map((post: BlogPost) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified || currentDate,
    priority: 0.7,
  }));

  // Sözlük detay sayfaları
  const dictionaryDetailPages = dictionaryTerms.map((term: DictionaryTerm) => ({
    url: `${baseUrl}/sozluk/${term.slug}`,
    lastModified: currentDate,
    priority: 0.6,
  }));

  // Kampanya detay sayfaları
  const campaignDetailPages = campaigns.map((campaign: Campaign) => ({
    url: `${baseUrl}/kampanyalar/${campaign.slug}`,
    lastModified: currentDate,
    priority: 0.8,
  }));

  return [
    ...mainPages,
    ...productPages,
    ...corporatePages,
    ...legalPages,
    ...blogDetailPages,
    ...dictionaryDetailPages,
    ...campaignDetailPages,
  ];
} 