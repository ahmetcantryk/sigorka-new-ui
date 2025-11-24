import React from 'react';
import Image from 'next/image';
interface ProductBoxProps {
  title: string;
  img: string;
  alt: string;
  link: string;
}

const ProductBox: React.FC<ProductBoxProps> = ({ title, img, alt, link }) => (
  <a href={link} className="product-box">
    <div className="product-box__img">
      <Image src={img} className="img-fluid" alt={alt} width={48} height={45} />
    </div>
    <h3 className="product-box__title" dangerouslySetInnerHTML={{ __html: title }} />
    <span className="product-box__link">
      Teklif Al <span className="icon-arrow-right"></span>
    </span>
  </a>
);

export default ProductBox; 