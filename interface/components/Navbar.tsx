'use client';

import { memo } from 'react';
import { useAuthUser, useAuthLoading } from '@/lib/authStore';
import NavbarLogo from './NavbarLogo';
import NavbarLinks from './NavbarLinks';
import NavbarLogout from './NavbarLogout';

const Navbar = memo(function Navbar() {
  const user = useAuthUser();
  const loading = useAuthLoading();

  // Don't show navbar if not authenticated
  if (loading || !user) {
    return null;
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <NavbarLogo />
        <NavbarLinks user={user} />
        <NavbarLogout />
      </div>
    </header>
  );
});

export default Navbar;
