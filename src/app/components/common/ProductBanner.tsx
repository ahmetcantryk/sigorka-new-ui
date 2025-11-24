import React from 'react';

interface ProductBannerProps {
  title1: string;
  title2: string;
  buttonText: string;
  buttonHref: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProductBanner: React.FC<ProductBannerProps> = ({ title1, title2, buttonText, buttonHref, size = 'sm' }) => (
  <section className={`cover cover--${size}`}>
    <div className="container cover__container">
      <h1 className="cover__title-1">{title1}</h1>
      <h2 className="cover__title-2">{title2}</h2>
    </div>
    <div className="d-flex justify-content-center">
      <a className="btn btn-wide btn-primary justify-content-center" href={buttonHref} target="_self">
        {buttonText}
      </a>
    </div>
  </section>
);

export default ProductBanner; 