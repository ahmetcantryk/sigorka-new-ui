import React from 'react';
import BlogCard from './BlogCard';
import { slugify } from './slugify';

interface Blog {
  id: number;
  title: string;
  summary: string;
  imageUrl: string;
  date: string;
  categories?: { id: number; name: string; value?: string }[];
  slug?: string;
}

interface BlogListProps {
  blogs: Blog[];
  selectedCategoryId?: number | null;
}

const BlogList: React.FC<BlogListProps> = ({ blogs }) => {
  // Slug'ı olmayan bloglar için başlıktan üret
  const blogsWithSlug = blogs.map(blog => ({
    ...blog,
    slug: blog.slug || slugify(blog.title),
  }));

  return (
    <div className="row">
      {blogsWithSlug.map((blog) => (
        <BlogCard key={blog.id} blog={{...blog, id: String(blog.id)}} />
      ))}
    </div>
  );
};

export default BlogList; 