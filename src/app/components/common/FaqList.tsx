'use client';

import React, { useState } from 'react';
import { useSlideAnimation } from '../../../hooks/useSlideAnimation';

interface Faq {
  question: string;
  answer: string;
}

interface FaqListProps {
  faqs: Faq[];
}

const FaqList: React.FC<FaqListProps> = ({ faqs }) => {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const toggleItem = (idx: number) => {
    if (activeItem === idx) {
      // Aynı item'a tıklandı, kapat
      setActiveItem(null);
    } else {
      // Farklı item'a tıklandı, önceki açık olanı kapat, yenisini aç
      setActiveItem(idx);
    }
  };

  return (
    <div className="faq-list">
      {faqs.map((faq, idx) => {
        const isActive = activeItem === idx;
        return (
          <FaqItem
            key={idx}
            question={faq.question}
            answer={faq.answer}
            isActive={isActive}
            onToggle={() => toggleItem(idx)}
          />
        );
      })}
    </div>
  );
};

interface FaqItemProps {
  question: string;
  answer: string;
  isActive: boolean;
  onToggle: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isActive, onToggle }) => {
  const { contentRef } = useSlideAnimation(isActive, 300);

  return (
    <div className={`faq-list__item${isActive ? ' faq-list__item--active' : ''}`}>
      <a
        className={`faq-list__item-link${isActive ? ' active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
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
        <p>{answer}</p>
      </div>
    </div>
  );
};

export default FaqList; 