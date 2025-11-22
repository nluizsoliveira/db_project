'use client';

import { memo } from 'react';
import Image from 'next/image';

const NavbarLogo = memo(function NavbarLogo() {
  return (
    <div className="flex items-center space-x-3">
      <Image
        src="/cefer.png"
        alt="CEFER"
        width={120}
        height={40}
        className="h-10 w-auto"
        priority
      />
    </div>
  );
});

export default NavbarLogo;
