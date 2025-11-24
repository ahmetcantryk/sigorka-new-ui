import type { Metadata } from 'next';
import './reset.css';

export const metadata: Metadata = {
  title: 'Yuvam Güvende | Sigorka',
  description: 'Yuvam Güvende Landing Page',
};

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

