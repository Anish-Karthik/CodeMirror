import React from 'react';

import { Appbar } from '@/components/Appbar';
import { Footer } from '@/components/Footer';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Appbar />
      {children}
      <Footer />
    </div>
  );
}
