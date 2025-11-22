'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, User, hasRole } from '@/lib/auth';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Don't show navbar if not authenticated
  if (loading || !user) {
    return null;
  }

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

  const showAdmin = hasRole(user, 'admin');
  const showStaff = hasRole(user, 'staff') || hasRole(user, 'admin');
  const showInternal = hasRole(user, 'internal') || hasRole(user, 'staff') || hasRole(user, 'admin');
  const showExternal = hasRole(user, 'external');
  const showReports = hasRole(user, 'admin') || hasRole(user, 'staff'); // Ajustar conforme necessário

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center space-x-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1094ab] text-white font-semibold">
            CE
          </span>
          <div className="text-lg font-semibold text-gray-800">CEFER</div>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          {showAdmin && (
            <Link href="/admin/dashboard" className={getLinkClassName('/admin/dashboard')}>
              Administração
            </Link>
          )}
          {showReports && (
            <Link href="/reports/overview" className={getLinkClassName('/reports/overview')}>
              Relatórios
            </Link>
          )}
          {showStaff && (
            <Link href="/staff/dashboard" className={getLinkClassName('/staff/dashboard')}>
              Equipe
            </Link>
          )}
          {showInternal && (
            <Link href="/internal/dashboard" className={getLinkClassName('/internal/dashboard')}>
              Interno
            </Link>
          )}
          {showExternal && (
            <Link href="/external/dashboard" className={getLinkClassName('/external/dashboard')}>
              Externo
            </Link>
          )}
        </nav>
        <Link
          href="/auth/logout"
          className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Sair
        </Link>
      </div>
    </header>
  );
}
