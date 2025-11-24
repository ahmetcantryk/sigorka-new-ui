import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { slugify } from './slugify';

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    slug: string;
    date: string;
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  // Blog slug değerini kontrol et, yoksa başlıktan oluştur
  const blogSlug = blog.slug || slugify(blog.title);
  
  return (
    <div className="col-lg-4 col-md-6">
      <Link href={`/blog/${blogSlug}`} className="blog-post">
        <div className="blog-post__img">
          <Image 
            src={blog.imageUrl}
            alt={blog.title}
            width={400}
            height={250}
            className="img-fluid"
            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
          />
        </div>
        <div className="blog-post__content">
          <h3 className="blog-post__title">{blog.title}</h3>
          <span className="blog-post__date">{blog.date}</span>
          <p className="blog-post__summary">{blog.summary}</p>
          <span className="blog-post__link">
            Devamını Oku <span className="icon-arrow-right"></span>
          </span>
        </div>
      </Link>
    </div>
  );
};

export default BlogCard; 