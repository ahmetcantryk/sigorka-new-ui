import React from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import { Metadata } from 'next';
import KampanyalarClient from './client';
import type { Kampanya } from './client';

async function getKampanyalar(): Promise<Kampanya[]> {
  const filePath = path.join(process.cwd(), 'public/kampanyalar.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export const metadata: Metadata = {
  title: "Sigorta Kampanyalarını Keşfet | Sigorka ",
  description: "Sigorka'nın avantajlı sigorta kampanyalarını keşfedin. Size özel indirimler, hediyeler ve fırsatlardan yararlanın. Hemen kampanyaları inceleyin!",
  alternates: {
    canonical: "https://sigorka.com/kampanyalar"
  },
  openGraph: {
    title: "Sigorta Kampanyalarını Keşfet | Sigorka Fırsatları",
    description: "Sigorka'nın avantajlı sigorta kampanyalarını keşfedin. Size özel indirimler, hediyeler ve fırsatlardan yararlanın. Hemen kampanyaları inceleyin!",
    url: "https://sigorka.com/kampanyalar",
    type: "website",
    images: [
      {
        url: "https://sigorka.com/images/sigorka-og-image.png",
        width: 1200,
        height: 630,
        alt: "Sigorta Kampanyalarını Keşfet | Sigorka Fırsatları"
      }
    ]
  },
  twitter: {
    title: "Sigorta Kampanyalarını Keşfet | Sigorka ",
    description: "Sigorka'nın avantajlı sigorta kampanyalarını keşfedin. Size özel indirimler, hediyeler ve fırsatlardan yararlanın. Hemen kampanyaları inceleyin!",
    card: "summary_large_image",
    images: ["https://sigorka.com/images/sigorka-og-image.png"]
  }
};

export default async function KampanyalarPage() {
  // Manuel sıralama: order alanı varsa ona göre, yoksa orijinal sıra
  const kampanyalar = (await getKampanyalar()).sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined && b.order === undefined) return -1;
    if (a.order === undefined && b.order !== undefined) return 1;
    return 0;
  });
  
  return <KampanyalarClient kampanyalar={kampanyalar} />;
} 