export const metadata = {
  title: 'Tamamlayıcı Sağlık Sigortası - Ekstra Güvence | Sigorka',
  description: 'SGK ile anlaşmalı hastanelerde fark ücreti ödemeden tedavi olmanızı sağlayan tamamlayıcı sağlık sigortasını keşfedin. Daha fazlası için sitemizi ziyaret edin.',
  alternates: {
    canonical: 'https://sigorka.com/tamamlayici-saglik-sigortasi'
  },
  openGraph: {
    title: 'Tamamlayıcı Sağlık Sigortası - Ekstra Güvence | Sigorka',
    description: 'SGK ile anlaşmalı hastanelerde fark ücreti ödemeden tedavi olmanızı sağlayan tamamlayıcı sağlık sigortasını keşfedin. Daha fazlası için sitemizi ziyaret edin.',
    url: 'https://sigorka.com/tamamlayici-saglik-sigortasi',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tamamlayıcı Sağlık Sigortası - Ekstra Güvence | Sigorka',
    description: 'SGK ile anlaşmalı hastanelerde fark ücreti ödemeden tedavi olmanızı sağlayan tamamlayıcı sağlık sigortasını keşfedin. Daha fazlası için sitemizi ziyaret edin.'
  }
};

export default function TamamlayiciSaglikSigortasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 