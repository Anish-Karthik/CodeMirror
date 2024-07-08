import type { Metadata } from 'next';
import { Chivo, Inter, Rubik } from 'next/font/google';

import { auth } from '@/auth';
import { default as Providers } from '@/components/provider/providers';
import './globals.css';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const chivo = Chivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-chivo',
});
const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
});
export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
  description: `${process.env.NEXT_PUBLIC_APP_NAME} playground`,
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={chivo.variable + ' ' + rubik.variable}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
