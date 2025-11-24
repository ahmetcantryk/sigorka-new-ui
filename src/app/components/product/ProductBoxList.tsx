import React from 'react';
import ProductBox from './ProductBox';

interface ProductBoxListProps {
  products: Array<{ title: string; img: string; alt: string; link: string }>;
}

const ProductBoxList: React.FC<ProductBoxListProps> = ({ products }) => (
  <div className="product-boxes">
    <div className="row flex-row flex-nowrap flex-sm-wrap justify-content-md-center">
      {products.map((product, idx) => (
        <div key={idx} className="col-xl-2 col-lg-3 col-md-6 col-5 mb-md-4">
          <ProductBox {...product} />
        </div>
      ))}
    </div>
  </div>
);

export default ProductBoxList; 