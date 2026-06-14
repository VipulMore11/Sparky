"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import pb from "@/lib/pb";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await pb.collection("users").authWithOAuth2({ provider: "google" });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthRedirect>
      <main className="flex min-h-[calc(100svh-56px)] items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-sm">
          {/* Enhanced Brand Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-8 group cursor-pointer"
              aria-label="CogniLab home"
            >
              <div
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200"
                aria-hidden
              >
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold tracking-tight">
                Cogni
                <span className="text-primary font-black text-4xl">Lab</span>
              </span>
            </Link>

            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Welcome back
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                Sign in to your CogniLab account to continue your research
                journey
              </p>
            </div>
          </div>

          <Card className="shadow-lg bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Use any email and password to continue (demo)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={onSubmit}>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="underline">
                    Sign up
                  </Link>{" "}
                  or{" "}
                  <Link href="/dashboard" className="underline">
                    skip to dashboard
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthRedirect>
  );
}
