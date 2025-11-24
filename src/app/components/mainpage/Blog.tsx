"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { slugify } from '../blog/slugify';

// Blog tipi
interface Blog {
  id: number;
  imageUrl: string;
  title: string;
  summary: string;
  slug?: string;
}

const Blog = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    fetch('/content/blogs.json')
      .then((res) => res.json())
      .then((data: Blog[]) => {
        // Son eklenen 12 blogu al (id'ye göre tersten sırala)
        const sorted = data.sort((a: Blog, b: Blog) => b.id - a.id);
        // Her blog için slug oluştur
        const blogsWithSlugs = sorted.slice(0, 12).map(blog => ({
          ...blog,
          slug: blog.slug || slugify(blog.title)
        }));
        setBlogs(blogsWithSlugs);
      });
  }, []);

  return (
    <section className="posts relative ">
      <Image
        src="/images/bg-testimonials.jpg"
        alt="Blog background"
        layout="fill"
        objectFit="cover"
        quality={75}
        className="-z-10"
      />
      <div className="posts__container">
        <h2 className="section-title"><span>Blog</span></h2>
        <div className="posts__slider posts__slider--top" data-animated="true">
          <div className="posts__slider-inner">
            {blogs.slice(0, 6).map((post) => (
              <Link 
                key={post.id} 
                className="posts__item posts__item--md" 
                href={`/blog/${post.slug}`}
                prefetch={false}
              >
                <div className="posts__item-img">
                  <Image 
                    src={post.imageUrl} 
                    className="img-fluid" 
                    alt={post.title} 
                    width={100} 
                    height={100}
                    loading="lazy"
                  />
                </div>
                <div className="posts__item-content">
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="posts__slider posts__slider--bottom" data-animated="true">
          <div className="posts__slider-inner">
            {blogs.slice(6, 12).map((post) => (
              <Link 
                key={post.id} 
                className="posts__item posts__item--md" 
                href={`/blog/${post.slug}`}
                prefetch={false}
              >
                <div className="posts__item-img">
                  <Image 
                    src={post.imageUrl} 
                    className="img-fluid" 
                    alt={post.title} 
                    width={100} 
                    height={100}
                    loading="lazy"
                  />
                </div>
                <div className="posts__item-content">
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog; 