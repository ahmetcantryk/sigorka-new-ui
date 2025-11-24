export const metadata = {
  title: 'İhtiyari Mali Mesuliyet | Sigorka',
  description: 'Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.',
  alternates: {
    canonical: 'https://sigorka.com/imm'
  },
  openGraph: {
    title: 'İhtiyari Mali Mesuliyet | Sigorka',
    description: 'Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.',
    url: 'https://sigorka.com/imm',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İhtiyari Mali Mesuliyet| Sigorka',
    description: 'Beklenmedik maddi zararlar karşısında bütçenizi koruyun. IMM sigortasıyla ek mali güvenceye hemen sahip olun.'
  }
};

export default function IMMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 