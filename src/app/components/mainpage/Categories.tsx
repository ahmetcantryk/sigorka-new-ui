import Image from 'next/image';
import Link from 'next/link';
const Categories = () => {
  return (
    <section className="categories">
      <div className="categories__container container">
        <div className="row">
          <div className="col-md-4">
            <Link href="/aracim" className="categories__item" target="_self">
              <Image 
                className="categories__item-img img-fluid" 
                src="/images/aracim.png"
                alt="Aracım" 
                width={122}
                height={140}
              />
              <div className="categories__item-content">
                <h2 className="categories__item-title">Aracım</h2>
                <p className="categories__item-desc">
                  Maddi ve fiziki hasarlara karşı önlem alın.
                </p>
              </div>
              <span className="categories__item-link">
                <span className="icon-arrow-right"></span>
              </span>
            </Link>
          </div>
          <div className="col-md-4">
            <Link href="/sagligim" className="categories__item" target="_self">
              <Image 
                className="categories__item-img img-fluid" 
                src="/images/sagligim.png"
                alt="Sağlığım" 
                width={122}
                height={140}
              />
              <div className="categories__item-content">
                <h2 className="categories__item-title">Sağlığım</h2>
                <p className="categories__item-desc">
                  Sağlığınızı korumak için zor günlerinizi güvenceye alın.
                </p>
              </div>
              <span className="categories__item-link">
                <span className="icon-arrow-right"></span>
              </span>
            </Link>
          </div>
          <div className="col-md-4">
            <Link href="/yuvam" target="_self" className="categories__item">
              <Image 
                className="categories__item-img img-fluid" 
                src="/images/yuvam.png"
                alt="Yuvam" 
                width={122}
                height={140}
              />
              <div className="categories__item-content">
                <h2 className="categories__item-title">Yuvam</h2>
                <p className="categories__item-desc">
                  Katılım Konut Sigortalarımız ile yuvanızı koruma altına alın.
                </p>
              </div>
              <span className="categories__item-link">
                <span className="icon-arrow-right"></span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories; 