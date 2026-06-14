"use client";

import type React from "react";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";
import pb from "@/lib/pb";
import { useAuthStore } from "@/stores/auth-store";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // const { loadProfile } = useAuthStore();
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const loadProfileData = async () => {
  //     setLoading(true);
  //     if (pb.authStore.isValid) {
  //       await loadProfile();
  //     }
  //     setLoading(false);
  //   };
  //   loadProfileData();
  // }, []);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }
    
  return (
    <html
      lang="en"
      className={`${inter.variable} ${GeistMono.variable} antialiased`}
    >
      <body className="font-sans bg-background text-foreground">
        <ThemeProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:ring-2 focus:ring-accent bg-background text-foreground px-3 py-2 rounded-md"
            >
              Skip to content
            </a>
            {children}
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
