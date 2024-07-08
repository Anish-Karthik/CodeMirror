'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { signIn, signOut } from 'next-auth/react';
import { CodeIcon } from './Icon';
import { ModeToggle } from './ModeToggle';

export function Appbar() {
  const user = useCurrentUser();

  return (
    <header className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white md:px-6">
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <CodeIcon className="h-6 w-6" />
        <span className="text-lg font-bold">
          {process.env.NEXT_PUBLIC_APP_NAME}
        </span>
      </Link>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="/contests" className="hover:underline" prefetch={false}>
          Contests
        </Link>
        <Link href="/problems" className="hover:underline" prefetch={false}>
          Problems
        </Link>
        <Link href="/standings" className="hover:underline" prefetch={false}>
          Standings
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <ModeToggle />
        {user && <Button onClick={() => signOut()}>Logout</Button>}

        {!user && <Button onClick={() => signIn()}>Sign in</Button>}
      </div>

      {/* {isLoading && <div className="flex items-center gap-4"></div>} */}
    </header>
  );
}
