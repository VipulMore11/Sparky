"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import pb from "@/lib/pb";
import { toast } from "sonner";

type VerificationStatus =
  | "checking"
  | "verified"
  | "pending"
  | "expired"
  | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [isChecking, setIsChecking] = useState(false);
  const email = pb.authStore.model?.email || "";
  const [countdown, setCountdown] = useState(0);


  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkVerificationStatus = async () => {
    setIsChecking(true);
    setStatus("checking");

    try {
      await pb.collection("users").authRefresh();
      if (pb.authStore.record?.verified) {
        setStatus("verified");
        router.push("/dashboard");
      } else {
        setStatus("pending");
      } 
    } catch (error) {
      setStatus("error");
    } finally {
      setIsChecking(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await pb.collection("users").requestVerification(email);
      setStatus("pending");
      setCountdown(60);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast.error("Failed to resend verification email");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "expired":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "checking":
        return <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />;
      default:
        return <Mail className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "verified":
        return {
          title: "Email Verified!",
          description:
            "Your email has been successfully verified. Redirecting to dashboard...",
          color: "text-green-600",
        };
      case "expired":
        return {
          title: "Verification Link Expired",
          description:
            "Your verification link has expired. Please request a new one.",
          color: "text-red-600",
        };
      case "error":
        return {
          title: "Verification Failed",
          description:
            "There was an error verifying your email. Please try again.",
          color: "text-red-600",
        };
      case "checking":
        return {
          title: "Checking Status...",
          description: "Please wait while we check your verification status.",
          color: "text-blue-600",
        };
      default:
        return {
          title: "Verify Your Email",
          description: `We've sent a verification link to ${
            email || "your email address"
          }. Please check your inbox and click the link to verify your account.`,
          color: "text-muted-foreground",
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <main className="flex min-h-[calc(100svh-56px)] items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6"
            aria-label="CogniLab home"
          >
            <div className="h-8 w-8 rounded-[6px] bg-primary" aria-hidden />
            <span className="text-2xl font-semibold tracking-tight">
              Cogni<span className="text-primary font-bold text-3xl">Lab</span>
            </span>
          </Link>
        </div>

        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <CardTitle className={`text-xl ${statusInfo.color}`}>
              {statusInfo.title}
            </CardTitle>
            <CardDescription className="text-center">
              {statusInfo.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "pending" && (
              <div className="space-y-4">
                <Button
                  onClick={checkVerificationStatus}
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Checking Status...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Check Verification Status
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Didn't receive the email?
                  </p>
                  <Button
                    variant="outline"
                    onClick={resendVerificationEmail}
                    disabled={countdown > 0}
                    className="w-full"
                  >
                    {countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {status === "verified" && (
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <p className="text-sm text-muted-foreground">
                    Redirecting to your dashboard...
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {(status === "expired" || status === "error") && (
              <div className="space-y-4">
                <Button
                  onClick={resendVerificationEmail}
                  disabled={countdown > 0}
                  className="w-full"
                >
                  {countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Request New Verification Email
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/signup")}
                  className="w-full"
                >
                  Back to Sign Up
                </Button>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
