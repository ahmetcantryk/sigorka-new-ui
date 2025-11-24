export const metadata = {
  title: 'Yabancı Sağlık Sigortası - İkamet İçin Zorunlu | Sigorka',
  description: 'Türkiye\'de yaşayan yabancılar için zorunlu sağlık sigortasını hızlıca yaptırın, ikamet başvurunuzu güvenceye alın. Daha fazlası için sitemizi ziyaret edin.',
  alternates: {
    canonical: 'https://sigorka.com/yabanci-saglik-sigortasi'
  },
  openGraph: {
    title: 'Yabancı Sağlık Sigortası - İkamet İçin Zorunlu | Sigorka',
    description: 'Türkiye\'de yaşayan yabancılar için zorunlu sağlık sigortasını hızlıca yaptırın, ikamet başvurunuzu güvenceye alın. Daha fazlası için sitemizi ziyaret edin.',
    url: 'https://sigorka.com/yabanci-saglik-sigortasi',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yabancı Sağlık Sigortası - İkamet İçin Zorunlu | Sigorka',
    description: 'Türkiye\'de yaşayan yabancılar için zorunlu sağlık sigortasını hızlıca yaptırın, ikamet başvurunuzu güvenceye alın. Daha fazlası için sitemizi ziyaret edin.'
  }
};

export default function YabanciSaglikSigortasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 