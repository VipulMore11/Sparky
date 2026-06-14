"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import pb from "@/lib/pb";

interface PrivateRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { profile, loadProfile } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      // Check if user is authenticated via PocketBase
      if (pb.authStore.isValid) {
        // Load profile if not already loaded
        if (!profile) {
          await loadProfile();
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkAuth();
  }, [loadProfile, profile]);

  useEffect(() => {
    console.log("text", profile);
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (profile?.verified === false && pathname !== "/verify-email") {
      router.replace("/verify-email");
      return;
    }

    // Check if user has a valid role (must be either "client" or "researcher")
    if (
      profile?.verified === true &&
      (!profile?.role ||
        (profile.role !== "client" && profile.role !== "researcher")) &&
      pathname !== "/select-role"
    ) {
      router.replace("/select-role");
    }

  }, [
    // isAuthenticated,
    // profile?.verified,
    profile?.role,
    // pathname,
    // router,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
