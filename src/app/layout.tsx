import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-coding' });

export const metadata: Metadata = {
  title: 'firstKodes',
  description:
    'Plataforma gamificada de ensino de programação para quem está começando.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jetbrainsMono.variable}`}>
      <body className={`${inter.className} overflow-x-hidden`}>{children}</body>
    </html>
  );
}
