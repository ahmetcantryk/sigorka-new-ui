'use client';

import React, { useState, useRef, useEffect } from 'react';
import Banner from '../components/common/Banner';
import Breadcrumb from '../components/common/Breadcrumb';
import { useSlideAnimation } from '../../hooks/useSlideAnimation';
import '../../styles/subpage.min.css';

// SSS veri tipi
interface FaqQuestion {
  id: number;
  question: string;
  answer: string;
}
interface FaqCategory {
  id: number;
  title: string;
  questions: FaqQuestion[];
}

interface SikcaSorulanSorularClientPageProps {
    categories: FaqCategory[];
}

export default function SikcaSorulanSorularClientPage({ categories }: SikcaSorulanSorularClientPageProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? 1);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const selectedCategory = categories.find((cat) => cat.id === activeCategory) ?? categories[0];

  const handleCategoryClick = (id: number) => {
    setActiveCategory(id);
    setActiveQuestion(null); // kategori değişince açık soru kapanır
    if (window.innerWidth < 768) {
      const nav = document.querySelector('.side-nav__nav');
      if (nav) nav.classList.toggle('side-nav__nav--open');
    }
  };

  const handleQuestionClick = (id: number) => {
    if (activeQuestion === id) {
      // Aynı soruya tıklandı, kapat
      setActiveQuestion(null);
    } else {
      // Farklı soruya tıklandı, önceki açık olanı kapat, yenisini aç
      setActiveQuestion(id);
    }
  };

  return (
    <>
      <Banner title1="Bilgi Merkezi" title2="Sıkça Sorulan Sorular" size="sm" />
      <section className="page-content">
        <div className="container">
          <Breadcrumb items={[
            { name: 'Ana Sayfa', href: '/' },
            { name: 'Bilgi Merkezi', href: '#' },
            { name: 'Sıkça Sorulan Sorular' }
          ]} />
          <div className="row pt-lg-4">
            <div className="col-lg-4 col-md-3">
              <nav className="side-nav">
                <ul className="side-nav__nav">
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      className={`side-nav__item${activeCategory === cat.id ? ' side-nav__item--active' : ''}`}
                      data-id={cat.id}
                    >
                      <a href="#" className="side-nav__link" onClick={e => { e.preventDefault(); handleCategoryClick(cat.id); }}>{cat.title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="col-lg-8 col-md-9">
              <div className="faq-list">
                {selectedCategory.questions.map((q) => {
                  const isActive = activeQuestion === q.id;
                  return (
                    <FaqQuestionItem
                      key={q.id}
                      question={q.question}
                      answer={q.answer}
                      isActive={isActive}
                      onToggle={() => handleQuestionClick(q.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

interface FaqQuestionItemProps {
  question: string;
  answer: string;
  isActive: boolean;
  onToggle: () => void;
}

const FaqQuestionItem: React.FC<FaqQuestionItemProps> = ({ question, answer, isActive, onToggle }) => {
  const { contentRef } = useSlideAnimation(isActive, 300);

  return (
    <div className={`faq-list__item${isActive ? ' faq-list__item--active' : ''}`}>
      <a
        className="faq-list__item-link"
        onClick={e => { e.preventDefault(); onToggle(); }}
        href="#"
      >
        <h4 className="faq-list__item-title">{question}</h4>
      </a>
      <div
        ref={contentRef}
        className="faq-list__item-body"
        style={{
          transition: 'height 0.3s ease-in-out'
        }}
      >
        <div>
          <p dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      </div>
    </div>
  );
}; 