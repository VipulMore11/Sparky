"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, FolderOpen, FlaskConical, BarChart3, Users, UserCog, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const navItems: NavItem[] = [
  // { label: "Overview", href: "/dashboard", icon: Home, exact: true },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { label: "Experiments", href: "/dashboard/experiments", icon: FlaskConical },
  { label: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
  { label: "Members", href: "/dashboard/members", icon: Users },
];

export function DashboardSidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const ActiveIcon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className="block">
                    <SidebarMenuButton
                      isActive={isActive(item.href, item.exact)}
                      className={cn("cursor-pointer")}
                    >
                      <ActiveIcon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
