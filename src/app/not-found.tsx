import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/subpage.min.css';

export const metadata: Metadata = {
  title: '404 | Sigorka',
  description: 'Aradığınız sayfa bulunamadı',
};

export default function NotFound() {
  return (
    <section className="cover cover--error-page">
      <div className="container cover__container">
        <Image
          src="/images/404.svg"
          className="img-fluid cover__img"
          alt="404"
          width={400}
          height={400}
          priority
        />
        <h2 className="cover__title-2">Bir şeyler ters gitti :(</h2>
        <p>Gitmek istediğiniz sayfa şu an bulunamıyor gibi gözüküyor.</p>
        <p>
          Adresi kontrol edebilir ya da ana sayfamıza giderek istediğiniz işlemi
          tekrar gerçekleştirebilirsiniz.
        </p>
        <Link href="/" className="btn btn-wide btn-tertiary">Ana Sayfaya Git</Link>
      </div>
    </section>
  );
} 