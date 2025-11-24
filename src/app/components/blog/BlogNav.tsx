import React, { useState } from 'react';

interface Category {
  id: number;
  name: string;
}

interface BlogNavProps {
  categories: Category[];
  selectedCategoryId: number;
  onCategoryChange: (id: number) => void;
}

const BlogNav: React.FC<BlogNavProps> = ({ categories, selectedCategoryId, onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (catId: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    onCategoryChange(catId);
    // Sadece mobilde nav açıkken herhangi bir kategoriye tıklanınca menü kapansın
    if (window.innerWidth < 768 && isOpen) {
      setIsOpen(false);
    } else if (window.innerWidth < 768 && catId === selectedCategoryId) {
      // Eğer nav kapalıysa ve aktif kategoriye tıklandıysa toggle
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <nav className="blog-nav">
      <ul className={`blog-nav__nav${isOpen ? ' blog-nav__nav--open' : ''}`}>
        {categories.map((cat) => (
          <li key={cat.id} className={`blog-nav__item${selectedCategoryId === cat.id ? ' blog-nav__item--active' : ''}`}>
            <a
              className="blog-nav__link"
              href="#"
              data-id={cat.id}
              onClick={handleCategoryClick(cat.id)}
            >
              {cat.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BlogNav; 