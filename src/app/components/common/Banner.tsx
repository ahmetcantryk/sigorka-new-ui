import React from 'react';
import Image from 'next/image';

type BannerProps = {
  title1: string;
  title2?: string;
  size?: 'sm' | 'md' | 'lg';
  bgImage?: string;
  icon?: string;
  icon2x?: string;
};

const Banner: React.FC<BannerProps> = ({ title1, title2, size = 'sm', bgImage, icon }) => (
  <section
    className={`cover cover--${size}`}
    style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
  >
    <div className="container cover__container">
      {icon && (
        <Image
          src={icon}
          alt={title2 || title1}
          width={62}
          height={72}
          className="cover__icon img-fluid"
          style={{ objectFit: 'cover'
           }}
        />
      )}
      <h1 className="cover__title-1">{title1}</h1>
      {title2 && <h2 className="cover__title-2">{title2}</h2>}
    </div>
  </section>
);

export default Banner; 