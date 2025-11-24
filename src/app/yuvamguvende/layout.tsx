import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';

// Minimal font import - hiçbir CSS eklemeyeceğiz
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-sans-3',
});

export const metadata: Metadata = {
  title: 'Yuvam Güvende',
  description: 'Yuvam Güvende Landing Page',
};

export default function YuvamGuvendeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" style={{ margin: 0, padding: 0 }}>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body 
        style={{ 
          margin: 0, 
          padding: 0, 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

