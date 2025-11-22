'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/lib/auth';
import { hasRole } from '@/lib/auth';

interface NavbarLinksProps {
  user: User;
}

const NavbarLinks = memo(function NavbarLinks({ user }: NavbarLinksProps) {
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

  const visibility = useMemo(
    () => ({
      showAdmin: hasRole(user, 'admin'),
      showStaff: hasRole(user, 'staff') || hasRole(user, 'admin'),
      showInternal: hasRole(user, 'internal') || hasRole(user, 'staff') || hasRole(user, 'admin'),
      showExternal: hasRole(user, 'external'),
      showReports: hasRole(user, 'admin') || hasRole(user, 'staff'),
    }),
    [user]
  );

  return (
    <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
      {visibility.showAdmin && (
        <Link href="/admin/dashboard" className={getLinkClassName('/admin/dashboard')}>
          Administração
        </Link>
      )}
      {visibility.showReports && (
        <Link href="/reports/overview" className={getLinkClassName('/reports/overview')}>
          Relatórios
        </Link>
      )}
      {visibility.showStaff && (
        <Link href="/staff/dashboard" className={getLinkClassName('/staff/dashboard')}>
          Equipe
        </Link>
      )}
      {visibility.showInternal && (
        <Link href="/internal/dashboard" className={getLinkClassName('/internal/dashboard')}>
          Interno
        </Link>
      )}
      {visibility.showExternal && (
        <Link href="/external/dashboard" className={getLinkClassName('/external/dashboard')}>
          Externo
        </Link>
      )}
    </nav>
  );
});

export default NavbarLinks;
