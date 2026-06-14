"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DashboardSidebarNav } from "@/components/dashboard/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PrivateRoute } from "@/components/auth/private-route";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggleRobust } from "@/components/theme/theme-toggle-robust";
import {
  LogOut,
  Settings,
  HelpCircle,
  User,
  Shield,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { getOrganization } = useAuthStore();
  const [shouldShowOrganization, setShouldShowOrganization] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      const organization = await getOrganization();
      console.log("organization", organization);
      if (organization && organization.items.length === 0) {
        setShouldShowOrganization(true);
      }
    };
    fetchOrganization();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getAvatarUrl = (user: any) => {
    if (user?.avatar) {
      return `https://bitnbuild.anuragpandey.codes/api/files/_pb_users_auth_/${user.id}/${user.avatar}`;
    }
    return undefined;
  };

  if (shouldShowOrganization) {
    return router.push("/select-organization");
  }

  return (
    <PrivateRoute>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="px-3 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div
                className="size-6 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200"
                aria-hidden
              >
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">CogniLab</span>
            </Link>
          </SidebarHeader>

          <DashboardSidebarNav />

          <SidebarSeparator />

          <SidebarFooter className="border-t bg-muted/30">
            <div className="p-3">
              {/* User Profile Section */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={getAvatarUrl(user)}
                    alt={`${user?.name || user?.email || "User"} avatar`}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(user?.name || user?.email || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* User Role Badge */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {user?.role || "Researcher"}
                </Badge>
                <div className="flex-1" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-8 text-xs justify-start"
                    >
                      <User className="h-3 w-3 mr-2" />
                      Profile
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/account")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/help")}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help & Support
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign Out</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to sign out? You'll need to sign
                        in again to access your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={logout}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Version Info */}
              <div className="mt-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>CogniLab v1.0.0</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    <ChevronUp
                      className={`h-3 w-3 transition-transform ${
                        isCollapsed ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </div>
                {isCollapsed && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>© 2024 CogniLab Research Platform</p>
                    <p className="mt-1">Built for behavioral research</p>
                  </div>
                )}
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-3 md:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <ThemeToggleRobust />
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </span>
            </div>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </PrivateRoute>
  );
}
