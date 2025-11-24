"use client";
import React, { useState } from 'react';
import Link from 'next/link';
interface DictionaryItem {
  id: number;
  title: string;
  summary: string;
  slug: string;
}

// Markdown bold formatını HTML'e çeviren utility function
function parseMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export default function SozlukSearch({ dictionary }: { dictionary: DictionaryItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(9);
  const WORDS_PER_PAGE = 6;

  function normalize(str: string) {
    return str
      .toLocaleLowerCase('tr-TR')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'c');
  }

  const filteredDictionary = dictionary.filter((item: DictionaryItem) =>
    normalize(item.title).includes(normalize(searchTerm))
  );

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + WORDS_PER_PAGE);
  };

  return (
    <>
      <div className="search-form mb-4">
        <div className="input-field-wrapper">
          <input
            type="text"
            className="form-control search-form__input"
            placeholder="Aranılacak Kelimeyi Giriniz"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <span
              className="search-form__clear"
              onClick={() => setSearchTerm('')}
            >
              ×
            </span>
          )}
        </div>
        <button type="button" className="search-form__button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_554_626)">
              <path d="M23.7068 22.2928L17.7378 16.3238C19.3644 14.3344 20.1642 11.7959 19.9716 9.23334C19.7791 6.67081 18.609 4.28031 16.7034 2.5563C14.7977 0.832293 12.3024 -0.0933258 9.73342 -0.029094C7.16447 0.0351379 4.71849 1.08431 2.9014 2.9014C1.08431 4.71849 0.0351379 7.16447 -0.029094 9.73342C-0.0933258 12.3024 0.832293 14.7977 2.5563 16.7034C4.28031 18.609 6.67081 19.7791 9.23334 19.9716C11.7959 20.1642 14.3344 19.3644 16.3238 17.7378L22.2928 23.7068C22.4814 23.8889 22.734 23.9897 22.9962 23.9875C23.2584 23.9852 23.5092 23.88 23.6946 23.6946C23.88 23.5092 23.9852 23.2584 23.9875 22.9962C23.9897 22.734 23.8889 22.4814 23.7068 22.2928ZM9.99978 17.9998C8.41753 17.9998 6.87081 17.5306 5.55522 16.6515C4.23963 15.7725 3.21425 14.5231 2.60875 13.0613C2.00324 11.5994 1.84482 9.99091 2.1535 8.43906C2.46218 6.88721 3.22411 5.46175 4.34293 4.34293C5.46175 3.22411 6.88721 2.46218 8.43906 2.1535C9.99091 1.84482 11.5994 2.00324 13.0613 2.60875C14.5231 3.21425 15.7725 4.23963 16.6515 5.55522C17.5306 6.87081 17.9998 8.41753 17.9998 9.99978C17.9974 12.1208 17.1538 14.1542 15.654 15.654C14.1542 17.1538 12.1208 17.9974 9.99978 17.9998Z" fill="#291F69"></path>
            </g>
            <defs>
              <clipPath id="clip0_554_626">
                <rect width="24" height="24" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>

      <h3>Katılım Sigortası Sözlüğü</h3>
      <div className="row dictionary-container">
        {filteredDictionary.length === 0 ? (
          <div className="col-12 text-center my-5">
            <h4>Aradığınız kelime bulunamadı.</h4>
          </div>
        ) : (
          filteredDictionary.slice(0, displayCount).map((item: DictionaryItem) => (
            <div key={item.id} className="col-lg-4 col-md-6">
              <Link href={`/sozluk/${item.slug}`} className="dictionary-item">
                <h4 className="dictionary-item__title">{item.title}</h4>
                <p 
                  className="dictionary-item__summary" 
                  style={{ whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdownBold(
                      item.summary
                        .replace(/<\/br>/g, '\n')
                        .replace(/<br>/g, '\n')
                    )
                  }}
                />
                <span className="dictionary-item__link">
                  Devamını Oku <span className="icon-arrow-right"></span>
                </span>
              </Link>
            </div>
          ))
        )}
      </div>

      {filteredDictionary.length > displayCount && (
        <div className="d-flex w-100 justify-content-center mt-4 mb-5">
          <button 
            className="btn btn-wide btn-outline-secondary"
            onClick={handleLoadMore}
          >
            Daha Fazla
          </button>
        </div>
      )}
    </>
  );
} 