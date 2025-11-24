import React from 'react';

const ProposalCta: React.FC = () => {
  return (
    <div className="offer-banner offer-banner-car-bg mb-5">
      <div className="offer-banner__content">
        <h3>Katılım Kasko Sigortasına mı ihtiyacınız var?</h3>
        <p>En uygun tekliflerle aracınızı kaskolamak için şimdi teklif alın.</p>
      </div>
      <div className="offer-banner__cta">
        <a className="btn btn-wide btn-tertiary" href="/kasko-teklif">
          Hemen Teklif Alın
        </a>
      </div>
    </div>
  );
};

export default ProposalCta;