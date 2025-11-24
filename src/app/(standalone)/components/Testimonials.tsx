'use client';

import TestimonialsSlider from './TestimonialsSlider';

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonialsContainer">
        <div className="testimonialsTitleWrapper">
          <h2 className="testimonialsTitle">Müşterilerimizin Deneyimleri</h2>
        </div>
        <p className="testimonialsDescription">
        Her biri gerçek kullanıcı hikayelerinden ilham alındı.<br/>  Yuvam Güvende, sadece eşyalarınızı değil; yaşam konforunuzu da korur.
        </p>
        
        <TestimonialsSlider />
      </div>
    </section>
  );
}

