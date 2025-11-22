'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthUser, useAuthLoading } from '@/lib/authStore';
import { hasRole } from '@/lib/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import NavbarLogo from './NavbarLogo';
import NavbarLogout from './NavbarLogout';

const ListItem = ({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <li {...props}>
      <NavigationMenuLink asChild data-active={isActive ? 'true' : 'false'}>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className={isActive ? "text-white/90 line-clamp-2 text-sm leading-snug" : "text-muted-foreground line-clamp-2 text-sm leading-snug"}>
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

const Navbar = memo(function Navbar() {
  const user = useAuthUser();
  const loading = useAuthLoading();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Don't show navbar if not authenticated
  if (loading || !user) {
    return null;
  }

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const visibility = {
    showAdmin: hasRole(user, 'admin'),
    showStaff: hasRole(user, 'staff') || hasRole(user, 'admin'),
    showInternal: hasRole(user, 'internal') || hasRole(user, 'staff') || hasRole(user, 'admin'),
    showExternal: hasRole(user, 'external'),
    showReports: hasRole(user, 'admin') || hasRole(user, 'staff') || hasRole(user, 'internal'),
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <NavbarLogo />
        <div className="relative flex-1 min-w-0 overflow-visible">
          <NavigationMenu viewport={isMobile}>
            <NavigationMenuList className="flex-wrap">
              {visibility.showAdmin && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                      data-active={isActiveRoute('/admin/dashboard') ? 'true' : 'false'}
                    >
                      <Link href="/admin/dashboard">Administração</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                      data-active={isActiveRoute('/auth/pending-registrations') ? 'true' : 'false'}
                    >
                      <Link href="/auth/pending-registrations">Cadastros Pendentes</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                      data-active={isActiveRoute('/admin/extension-groups') ? 'true' : 'false'}
                    >
                      <Link href="/admin/extension-groups">Grupos de Extensão</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
              {visibility.showReports && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                    data-active={isActiveRoute('/reports/overview') ? 'true' : 'false'}
                  >
                    <Link href="/reports/overview">Relatórios</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
              {visibility.showStaff && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    data-active={
                      isActiveRoute('/staff/activities') ||
                      isActiveRoute('/staff/participants') ||
                      isActiveRoute('/staff/installations') ||
                      isActiveRoute('/staff/equipment')
                        ? 'true'
                        : 'false'
                    }
                  >
                    Equipe
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="!left-0 !right-auto max-w-[calc(100vw-3rem)]">
                    <ul className="grid gap-2 w-[280px] sm:w-[350px] md:w-[450px] md:grid-cols-2">
                      <ListItem href="/staff/activities" title="Atividades">
                        Gerenciar e visualizar atividades
                      </ListItem>
                      <ListItem href="/staff/participants" title="Participantes">
                        Gerenciar participantes das atividades
                      </ListItem>
                      <ListItem href="/staff/installations" title="Reservas de Instalações">
                        Gerenciar reservas de instalações
                      </ListItem>
                      <ListItem href="/staff/equipment" title="Reservas de Equipamentos">
                        Gerenciar reservas de equipamentos
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
              {visibility.showInternal && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    data-active={
                      isActiveRoute('/internal/reservations') ||
                      isActiveRoute('/internal/activities') ||
                      isActiveRoute('/internal/new-reservation') ||
                      isActiveRoute('/internal/invites')
                        ? 'true'
                        : 'false'
                    }
                  >
                    Interno
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="!left-0 !right-auto max-w-[calc(100vw-3rem)]">
                    <ul className="grid gap-2 w-[280px] sm:w-[350px] md:w-[450px] md:grid-cols-2">
                      <ListItem href="/internal/reservations" title="Minhas Reservas">
                        Visualizar e gerenciar minhas reservas
                      </ListItem>
                      <ListItem href="/internal/activities" title="Atividades">
                        Visualizar e inscrever-se em atividades
                      </ListItem>
                      <ListItem href="/internal/new-reservation" title="Nova Reserva">
                        Fazer nova reserva de instalação ou equipamento
                      </ListItem>
                      <ListItem href="/internal/invites" title="Convites">
                        Criar e gerenciar convites para usuários externos
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
              {visibility.showExternal && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                    data-active={isActiveRoute('/external/dashboard') ? 'true' : 'false'}
                  >
                    <Link href="/external/dashboard">Externo</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <NavbarLogout />
      </div>
    </header>
  );
});

export default Navbar;
