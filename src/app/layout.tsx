import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { siteUrl } from '@/lib/site';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Nexteo — Ton business. Construis-le.',
  description:
    'Découvre l’activité qui te correspond, puis suis un parcours étape par étape pour la construire.',
  metadataBase: new URL(siteUrl()),
};

export const viewport: Viewport = {
  themeColor: '#0D1E38',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
