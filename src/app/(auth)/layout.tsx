import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './../globals.css';
import { APP_CONFIG, theme } from '@/config/app';

const fontSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} | Login`,
  description: APP_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main>{children}</main>;
}
