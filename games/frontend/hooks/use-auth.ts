"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    loading,
    isAuthenticated,
    isVerified,
    hasRole,
    roleCheckLoading,
    login,
    logout,
    checkAuth,
    checkVerification,
    setLoading,
  } = useAuthStore();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Enhanced login with router redirect
  const loginWithRedirect = async (email: string, password: string) => {
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  // Enhanced logout with router redirect
  const logoutWithRedirect = () => {
    logout();
    router.push("/login");
  };

  return {
    user,
    loading,
    isAuthenticated,
    isVerified,
    hasRole,
    roleCheckLoading,
    login: loginWithRedirect,
    logout: logoutWithRedirect,
    checkVerification,
    setLoading,
  };
}
