import Link from 'next/link';
import Image from 'next/image';

export default function ServerHeader() {
  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <Link href="/" className="header__logo">
            <Image 
              src="/images/sigorka-logo.svg" 
              alt="Sigorka" 
              width={120} 
              height={40}
              priority
            />
          </Link>
          
          <nav className="header__nav">
            <Link href="/aracim" className="header__nav-item">
              Aracım
            </Link>
            <Link href="/sagligim" className="header__nav-item">
              Sağlığım
            </Link>
            <Link href="/yuvam" className="header__nav-item">
              Yuvam
            </Link>
            <Link href="/blog" className="header__nav-item">
              Blog
            </Link>
            <Link href="/iletisim" className="header__nav-item">
              İletişim
            </Link>
          </nav>

          <div className="header__actions">
            <Link href="/giris-yap" className="btn btn-outline">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}