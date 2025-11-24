"use client";
import { useState, useMemo, useRef } from 'react';
import BlogList from './BlogList';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  value: string;
}

interface Blog {
  id?: number;
  title: string;
  date: string;
  slug?: string;
  imageUrl?: string;
  htmlContent?: string;
  categories?: { id: number; name: string; value?: string }[];
  summary?: string;
}

const ITEMS_PER_PAGE = 9;

// Türkçe ay isimleri
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export default function BlogClientArea({ blogs, categories }: { blogs: Blog[], categories: Category[] }) {
  const [selectedCategoryValue, setSelectedCategoryValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const blogSectionRef = useRef<HTMLDivElement>(null);
  
  // Tarihe göre sıralama fonksiyonu
  const parseDate = (dateStr: string): number => {
    try {
      const parts = dateStr.trim().split(' ');
      if (parts.length !== 3) return 0;
      
      const day = parseInt(parts[0]);
      const monthName = parts[1];
      const year = parseInt(parts[2]);
      
      const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
      if (monthIndex === -1 || isNaN(day) || isNaN(year)) return 0;
      
      return new Date(year, monthIndex, day).getTime();
    } catch {
      return 0;
    }
  };
  
  // Filtrelenmiş ve tarih sıralı bloglar
  const filteredBlogs = useMemo(() => {
    let filtered = selectedCategoryValue 
      ? blogs.filter(blog => blog.categories?.some(cat => cat.value === selectedCategoryValue))
      : blogs;
    
    // Tarihe göre sırala (en yeni önce)
    return filtered.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [blogs, selectedCategoryValue]);

  // Sayfalama
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Sayfa değiştiğinde ve kategori değiştiğinde başa dön
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryValue(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Blog listesinin başına scroll et
    if (blogSectionRef.current) {
      const offsetTop = blogSectionRef.current.offsetTop - 100; // 100px yukarıdan boşluk
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div ref={blogSectionRef} className="d-flex justify-content-between flex-wrap align-items-center mb-4">
        <h3 className="blog-section__title mb-0">Tüm Yazılar</h3>
        <div className="blog-section__filter-container">
          <span className="blog-section__filter-label">Filtrele:</span>
          <select 
            className="blog-section__filter"
            value={selectedCategoryValue}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {paginatedBlogs.length > 6 ? (
        <>
          {/* İlk 6 blog */}
          <BlogList blogs={paginatedBlogs.slice(0, 6).map(blog => ({
            id: blog.id || 0,
            title: blog.title,
            summary: blog.summary || '',
            imageUrl: blog.imageUrl || '/images/no-image.jpg',
            date: blog.date,
            categories: blog.categories,
            slug: blog.slug
          }))} selectedCategoryId={1} />
          
          {/* CTA Banner - Her sayfada ilk 6 blogdan sonra */}
          <div className="offer-banner mt-2 mb-5">
            <div className="offer-banner__content">
              <h3>Katılım Kasko Sigortasına mı ihtiyacınız var?</h3>
              <p>En uygun tekliflerle aracınızı kaskolamak için şimdi teklif alın.</p>
            </div>
            <div className="offer-banner__cta">
              <Link className="btn btn-wide btn-tertiary" href="/kasko-teklif">
                Hemen Teklif Alın
              </Link>
            </div>
          </div>
          
          {/* Kalan 3 blog */}
          <BlogList blogs={paginatedBlogs.slice(6).map(blog => ({
            id: blog.id || 0,
            title: blog.title,
            summary: blog.summary || '',
            imageUrl: blog.imageUrl || '/images/no-image.jpg',
            date: blog.date,
            categories: blog.categories,
            slug: blog.slug
          }))} selectedCategoryId={1} />
        </>
      ) : (
        <BlogList blogs={paginatedBlogs.map(blog => ({
          id: blog.id || 0,
          title: blog.title,
          summary: blog.summary || '',
          imageUrl: blog.imageUrl || '/images/no-image.jpg',
          date: blog.date,
          categories: blog.categories,
          slug: blog.slug
        }))} selectedCategoryId={1} />
      )}

      {totalPages > 1 && (() => {
        // Gösterilecek sayfa numaralarını hesapla (maksimum 3)
        let pageNumbers: number[] = [];
        
        if (totalPages <= 3) {
          // Toplam 3 veya daha az sayfa varsa hepsini göster
          pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
          // 3'ten fazla sayfa varsa akıllı seçim yap
          if (currentPage === 1) {
            pageNumbers = [1, 2, 3];
          } else if (currentPage === totalPages) {
            pageNumbers = [totalPages - 2, totalPages - 1, totalPages];
          } else {
            pageNumbers = [currentPage - 1, currentPage, currentPage + 1];
          }
        }

        return (
          <nav className="d-flex justify-content-center my-4" aria-label="Pagination">
            <ul className="pagination">
              {/* Geri Butonu */}
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <a 
                  className="page-link"
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
                >
                  <span className="icon-angle-left"></span>
                </a>
              </li>
              
              {/* Sayfa Numaraları (Maksimum 3) */}
              {pageNumbers.map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <a 
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                    style={{ cursor: 'pointer' }}
                  >
                    {page}
                  </a>
                </li>
              ))}
              
              {/* İleri Butonu */}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <a 
                  className="page-link"
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                >
                  <span className="icon-angle-right"></span>
                </a>
              </li>
            </ul>
          </nav>
        );
      })()}
    </>
  );
} 