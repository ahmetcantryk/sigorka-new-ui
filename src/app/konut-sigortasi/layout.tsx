export const metadata = {
  title: 'Konut Sigortası - Evinizi Güvence Altına Alın | Sigorka',
  description: 'Yangın, hırsızlık ve doğal afetlere karşı evinizi koruyun. Uygun fiyatlı konut sigortasını Sigorka ile kolayca alın. Daha fazlası için sitemizi ziyaret edin.',
  alternates: {
    canonical: 'https://sigorka.com/konut-sigortasi'
  },
  openGraph: {
    title: 'Konut Sigortası - Evinizi Güvence Altına Alın | Sigorka',
    description: 'Yangın, hırsızlık ve doğal afetlere karşı evinizi koruyun. Uygun fiyatlı konut sigortasını Sigorka ile kolayca alın. Daha fazlası için sitemizi ziyaret edin.',
    url: 'https://sigorka.com/konut-sigortasi',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Konut Sigortası - Evinizi Güvence Altına Alın | Sigorka',
    description: 'Yangın, hırsızlık ve doğal afetlere karşı evinizi koruyun. Uygun fiyatlı konut sigortasını Sigorka ile kolayca alın. Daha fazlası için sitemizi ziyaret edin.'
  }
};

export default function KonutSigortasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}