"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarClock,
  CalendarPlus,
  CalendarRange,
  ChartBar,
  ClipboardCheck,
  ExternalLink,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Ticket,
  University,
  UserCog,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { useAuthUser, useAuthLoading } from "@/lib/authStore";
import { hasRole } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import NavbarLogo from "./NavbarLogo";
import NavbarLogout from "./NavbarLogout";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type IconMenuItemProps = NavItem & {
  isActive: boolean;
};

const IconMenuItem = ({
  href,
  label,
  description,
  icon: Icon,
  isActive,
}: IconMenuItemProps) => (
  <li>
    <NavigationMenuLink
      asChild
      data-active={isActive ? "true" : "false"}
      className="hover:bg-muted/60 focus:bg-muted/80"
    >
      <Link
        href={href}
        className="flex items-start gap-3 rounded-md px-3 py-2 hover:no-underline"
      >
        <div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium leading-none">{label}</p>
          <p
            className={`text-xs leading-snug ${
              isActive ? "text-white/90" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        </div>
      </Link>
    </NavigationMenuLink>
  </li>
);

const Navbar = memo(function Navbar() {
  const user = useAuthUser();
  const loading = useAuthLoading();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (loading || !user) {
    return null;
  }

  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const visibility = {
    showAdmin: hasRole(user, "admin"),
    showStaff: hasRole(user, "staff") || hasRole(user, "admin"),
    showInternal:
      hasRole(user, "internal") ||
      hasRole(user, "staff") ||
      hasRole(user, "admin"),
    showExternal: hasRole(user, "external"),
    showReports: hasRole(user, "admin") || hasRole(user, "staff"),
  };

  const adminItems: NavItem[] = [
    {
      href: "/admin/dashboard",
      label: "Painel Administrativo",
      description: "Visão geral de pessoas, reservas e atividades do CEFER",
      icon: LayoutDashboard,
    },
    {
      href: "/auth/pending-registrations",
      label: "Aprovar Cadastros",
      description: "Solicitações de novos usuários e validação de acesso",
      icon: ClipboardCheck,
    },
    {
      href: "/admin/management",
      label: "Gestão de Recursos",
      description:
        "Atividades, instalações, equipamentos, eventos, usuários e grupos de extensão",
      icon: Wrench,
    },
  ];

  const staffItems: NavItem[] = [
    {
      href: "/staff/activities",
      label: "Agenda da Equipe",
      description: "Filtros e criação de atividades do dia a dia",
      icon: CalendarClock,
    },
    {
      href: "/staff/participants",
      label: "Participantes",
      description: "Inscrições, presença e turmas em andamento",
      icon: UserRound,
    },
    {
      href: "/staff/installations",
      label: "Instalações",
      description: "Reservas e ajustes de espaços esportivos",
      icon: Building2,
    },
    {
      href: "/staff/equipment",
      label: "Equipamentos",
      description: "Empréstimos e reservas de materiais",
      icon: Package,
    },
  ];

  const internalItems: NavItem[] = [
    {
      href: "/internal/reservations",
      label: "Minhas Reservas",
      description: "Histórico e consultas por CPF de membro USP",
      icon: CalendarRange,
    },
    {
      href: "/internal/activities",
      label: "Atividades USP",
      description: "Visualizar turmas disponíveis e se inscrever",
      icon: Users,
    },
    {
      href: "/internal/new-reservation",
      label: "Nova Reserva",
      description: "Solicitar instalação ou equipamento para uso próprio",
      icon: CalendarPlus,
    },
    {
      href: "/internal/invites",
      label: "Convites para Convidados",
      description: "Gerar e acompanhar convites para externos",
      icon: Ticket,
    },
  ];

  const renderMenuGroup = (
    label: string,
    Icon: LucideIcon,
    items: NavItem[]
  ) => (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        data-active={
          items.some((item) => isActiveRoute(item.href)) ? "true" : "false"
        }
        className="gap-2"
      >
        <Icon className="size-4" />
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="!left-0 !right-auto z-50 md:z-[70] max-w-[calc(100vw-3rem)]">
        <ul className="grid w-[320px] gap-2 sm:w-[420px] md:w-[520px] md:grid-cols-2">
          {items.map((item) => (
            <IconMenuItem
              key={item.href}
              {...item}
              isActive={isActiveRoute(item.href)}
            />
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <NavbarLogo />
        <div className="relative min-w-0 flex-1 overflow-visible">
          <NavigationMenu viewport={isMobile}>
            <NavigationMenuList className="flex-wrap">
              {visibility.showAdmin &&
                renderMenuGroup("Administração", ShieldCheck, adminItems)}
              {visibility.showStaff &&
                renderMenuGroup("Área do Funcionário", UserCog, staffItems)}
              {visibility.showInternal &&
                renderMenuGroup("Área USP", University, internalItems)}
              {visibility.showExternal && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                    data-active={
                      isActiveRoute("/external/dashboard") ? "true" : "false"
                    }
                  >
                    <Link
                      href="/external/dashboard"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="size-4" />
                      Convidado
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
              {visibility.showReports && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                    data-active={
                      isActiveRoute("/reports/overview") ? "true" : "false"
                    }
                  >
                    <Link href="/reports/overview">
                      <div className="flex items-center gap-2">
                        <ChartBar
                          className={cn(
                            "size-4 transition-colors duration-300",
                            isActiveRoute("/reports/overview")
                              ? "text-white"
                              : "text-muted-foreground"
                          )}
                        />
                        <span className="text-sm font-medium transition-colors ">
                          Relatórios
                        </span>
                      </div>
                    </Link>
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
