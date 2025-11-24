'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="heroHeader">
      <Link href="http://sigorka.com/" prefetch={false}>
        <Image
          src="/images/footer-logo.svg"
          alt="Sigorka"
          width={220}
          height={72}
          priority
        />
      </Link>
    </header>
  );
}






