import Link from 'next/link';
import Image from 'next/image';

export default function ServerFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__section">
            <Link href="/" className="footer__logo">
              <Image 
                src="/images/sigorka-logo-white.svg" 
                alt="Sigorka" 
                width={120} 
                height={40}
              />
            </Link>
            <p className="footer__description">
              Katılım sigortacılığında modern yaklaşım
            </p>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Ürünler</h3>
            <ul className="footer__list">
              <li><Link href="/kasko-sigortasi">Kasko Sigortası</Link></li>
              <li><Link href="/zorunlu-trafik-sigortasi">Trafik Sigortası</Link></li>
              <li><Link href="/konut-sigortasi">Konut Sigortası</Link></li>
              <li><Link href="/dask">DASK</Link></li>
              <li><Link href="/ozel-saglik-sigortasi">Özel Sağlık Sigortası</Link></li>
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Kurumsal</h3>
            <ul className="footer__list">
              <li><Link href="/biz-kimiz">Biz Kimiz</Link></li>
              <li><Link href="/iletisim">İletişim</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/sikca-sorulan-sorular">SSS</Link></li>
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">Yasal</h3>
            <ul className="footer__list">
              <li><Link href="/kvkk">KVKK</Link></li>
              <li><Link href="/kullanici-sozlesmesi">Kullanıcı Sözleşmesi</Link></li>
              <li><Link href="/cerez-politikasi">Çerez Politikası</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p>&copy; 2024 Sigorka. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}