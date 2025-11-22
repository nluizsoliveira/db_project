'use client';

import { memo } from 'react';
import Link from 'next/link';

const NavbarLogout = memo(function NavbarLogout() {
  return (
    <Link
      href="/auth/logout"
      className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
    >
      Sair
    </Link>
  );
});

export default NavbarLogout;
