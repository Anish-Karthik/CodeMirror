/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { TRPCReactProvider } from '@/app/_trpc/Provider';
import { SessionProvider } from 'next-auth/react';
import { type Session } from 'next-auth/types';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toaster-provider';
import { ToastifyProvider } from './toastify-provider';

const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  return (
    <SessionProvider session={session}>
      <TRPCReactProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastifyProvider />
          <ToastProvider />
          {children}
        </ThemeProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
};

export default Providers;
