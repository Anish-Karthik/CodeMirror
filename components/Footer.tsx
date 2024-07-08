import Link from 'next/link';

export function Footer() {
  return (
    <footer className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white md:px-6">
      <div className="text-sm">
        &copy; 2024 {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
      </div>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="#" className="hover:underline" prefetch={false}>
          About
        </Link>
        <Link href="#" className="hover:underline" prefetch={false}>
          Contact
        </Link>
        <Link href="#" className="hover:underline" prefetch={false}>
          Privacy Policy
        </Link>
        <Link href="#" className="hover:underline" prefetch={false}>
          Terms of Service
        </Link>
      </nav>
    </footer>
  );
}
