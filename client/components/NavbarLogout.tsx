'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavbarLogout = memo(function NavbarLogout() {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getLinkClassName = (href: string) => {
    const baseClasses = 'px-3 py-2 rounded transition-colors';
    if (isActiveRoute(href)) {
      return `${baseClasses} text-[#1094ab] font-semibold bg-[#1094ab]/10 hover:bg-[#1094ab]/20`;
    }
    return `${baseClasses} text-gray-600 hover:text-[#1094ab] hover:bg-gray-100`;
  };

  return (
    <div className="flex items-center gap-4">
      <Link href="/auth/change-password" className={getLinkClassName('/auth/change-password')}>
        Alterar Senha
      </Link>
      <Link
        href="/auth/logout"
        className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
      >
        Sair
      </Link>
    </div>
  );
});

export default NavbarLogout;
