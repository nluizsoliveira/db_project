'use client';

import { memo } from 'react';

const NavbarLogo = memo(function NavbarLogo() {
  return (
    <div className="flex items-center space-x-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1094ab] text-white font-semibold">
        CE
      </span>
      <div className="text-lg font-semibold text-gray-800">CEFER</div>
    </div>
  );
});

export default NavbarLogo;
