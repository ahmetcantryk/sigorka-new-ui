import { notFound } from 'next/navigation';
import '../../../styles/main.min.css';
import '../../../styles/subpage.min.css';
import '../../../styles/armor.css';
import Image from 'next/image';
import { Metadata } from 'next';

import BlogCard from '../../components/blog/BlogCard';
import { slugify } from '../../components/blog/slugify';
import BlogDetailClient from './client';
import { getCTAConfigForBlog } from '../utils/ctaConfig';

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
  imageUrl?: string;
  htmlContent?: string;
  summary?: string;
  categories?: Category[];
}

// Next.js SSG için static paramlar
export async function generateStaticParams() {
  const blogs = (await import('../../../../public/content/blogs.json')).default as Blog[];
  return blogs.map((blog) => ({
    slug: blog.slug || slugify(blog.title),
  }));
}

export async function generateMetadata({params}: {params: Promise<{ slug: string }>}): Promise<Metadata> {
  const { slug } = await params;
  // Statik import kullanarak JSON dosyasını getiriyoruz
  const blogs = (await import('../../../../public/content/blogs.json')).default as Blog[];
  const blog = blogs.find((b: Blog) => (b.slug || slugify(b.title)) === slug);
  
  if (!blog) {
    return {
      title: "Blog Yazısı Bulunamadı | Sigorka",
      description: "Aradığınız blog yazısı bulunamadı. Güncel yazılarımızı incelemek için sitemizi ziyaret edin."
    };
  }

  return {
    title: `${blog.title} | Sigorka Blog`,
    description: blog.summary || `${blog.title} hakkında detaylı bilgi için Sigorka blog sayfamızı ziyaret edin.`,
    alternates: {
      canonical: `https://sigorka.com/blog/${slug}`
    },
    openGraph: {
      title: `${blog.title} | Sigorka Blog`,
      description: blog.summary || `${blog.title} hakkında detaylı bilgi için Sigorka blog sayfamızı ziyaret edin.`,
      url: `https://sigorka.com/blog/${slug}`,
      type: "article",
      images: [
        {
          url: blog.imageUrl || '/images/no-image.jpg',
          alt: blog.title
        }
      ]
    },
    twitter: {
      title: `${blog.title} | Sigorka Blog`,
      description: blog.summary || `${blog.title} hakkında detaylı bilgi için Sigorka blog sayfamızı ziyaret edin.`,
      card: "summary_large_image",
      images: [blog.imageUrl || '/images/no-image.jpg']
    }
  };
}

export default async function BlogDetailPage({params}: {params: Promise<{ slug: string }>}) {
  const { slug } = await params;
  // Statik import kullanarak JSON dosyasını getiriyoruz
  const blogs = (await import('../../../../public/content/blogs.json')).default as Blog[];
  const blog = blogs.find((b: Blog) => (b.slug || slugify(b.title)) === slug);
  if (!blog) return notFound();

  // Blog kategorisine göre CTA config'i al
  const ctaConfig = getCTAConfigForBlog(blog.categories);

  // Benzer yazılar: aynı kategoriden, bu blog hariç, son 3 blog
  let similarBlogs: Blog[] = [];
  if (!blog.categories || blog.categories.length === 0) {
    similarBlogs = blogs.filter((b: Blog) => (b.slug || slugify(b.title)) !== slug).slice(0, 3);
  } else {
    const catId = blog.categories[0].id;
    similarBlogs = blogs
      .filter((b: Blog) => (b.slug || slugify(b.title)) !== slug && b.categories && b.categories.some((c: Category) => c.id === catId))
      .slice(0, 3);
  }

  return (
    <>
      <BlogDetailClient categories={blog.categories} />
      <section className="cover cover--sm">
        <div className="container cover__container">
          <h1 className="cover__title-1">Bilgi Merkezi</h1>
          <h2 className="cover__title-2">Blog</h2>
        </div>
      </section>
      <section className="blog-post">
        <div className="container container--sm">
          <div className="blog-post-intro">
            <div className="row">
              <div className="col-md-8">
                <div className="blog-post-intro__img" id="blog-post-intro__img">
                  <Image 
                    className="blog-promo__item-img" 
                    src={blog.imageUrl || '/images/no-image.jpg'} 
                    alt={blog.title}
                    width={800}
                    height={500}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                    priority
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="offer-banner offer-banner--alt">
                  <div className="offer-banner__content">
                    <h3>{ctaConfig.title}</h3>
                    <p>{ctaConfig.description}</p>
                  </div>
                  <div className="offer-banner__cta">
                    <a className="btn btn-wide btn-tertiary" href={ctaConfig.buttonLink} target="_self">{ctaConfig.buttonText}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-content selected-blog-container">
            <h3>{blog.title}</h3>
            <span className="date">{blog.date}</span>
            <div dangerouslySetInnerHTML={{ __html: blog.htmlContent || '' }} />
          </div>
          <div className="offer-banner offer-banner-car-bg mt-2 mb-5">
            <div className="offer-banner__content">
              <h3>{ctaConfig.title}</h3>
              <p>{ctaConfig.description}</p>
            </div>
            <div className="offer-banner__cta">
              <a className="btn btn-wide btn-tertiary" href={ctaConfig.buttonLink} target="_self">{ctaConfig.buttonText}</a>
            </div>
          </div>
          <h3 className="blog-section__title">Benzer Yazılar</h3>
          <div className="row suggest-blogs">
            {similarBlogs.map((b) => <BlogCard key={b.id} blog={{
              id: String(b.id || 0),
              title: b.title,
              summary: b.summary || '',
              imageUrl: b.imageUrl || '/images/no-image.jpg',
              slug: b.slug || slugify(b.title),
              date: b.date
            }} />)}
          </div>
        </div>
      </section>
    </>
  );
} 