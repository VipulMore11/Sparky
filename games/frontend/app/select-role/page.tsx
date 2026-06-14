"use client";

import type React from "react";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import pb from "@/lib/pb";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { PrivateRoute } from "@/components/auth/private-route";
import { useAuthStore } from "@/stores/auth-store";

const roleSchema = z.object({
  role: z.enum(["researcher", "volunteer"], {
    required_error: "Please select your role",
  }),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function SelectRolePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { loadProfile } = useAuthStore();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role: undefined,
    },
  });

  const onSubmit = async (data: RoleFormData) => {
    if (!user) return;

    setLoading(true);

    try {
      const payload = {
        user: user.id,
        role: data.role,
        consent: true,
      };
      await pb.collection("user_data").create(payload);
      await loadProfile();
      
      // Both roles should go to organization selection
      router.push("/select-organization");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role");
    }
    setLoading(false);
  };

  return (
    <PrivateRoute>
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
                Cogni
                <span className="text-primary font-bold text-3xl">Lab</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Choose Your Role
            </h1>
            <p className="text-muted-foreground text-sm">
              Please select how you'd like to use CogniLab
            </p>
          </div>

          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>I am joining as a...</CardTitle>
              <CardDescription>
                This helps us customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className="grid gap-6"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 gap-4">
                            <div
                              className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                                field.value === "researcher"
                                  ? "ring-2 ring-primary bg-primary/5"
                                  : ""
                              }`}
                              onClick={() => field.onChange("researcher")}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                                  field.value === "researcher"
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {field.value === "researcher" && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="text-base font-medium cursor-pointer">
                                  Researcher
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Conduct experiments, create studies, and
                                  analyze behavioral data
                                </p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  • Create and manage experiments
                                  <br />
                                  • Access analytics and insights
                                  <br />• Recruit participants
                                </div>
                              </div>
                            </div>
                            <div
                              className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                                field.value === "volunteer"
                                  ? "ring-2 ring-primary bg-primary/5"
                                  : ""
                              }`}
                              onClick={() => field.onChange("volunteer")}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                                  field.value === "volunteer"
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {field.value === "volunteer" && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="text-base font-medium cursor-pointer">
                                  Volunteer
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Participate in research studies and contribute
                                  to science
                                </p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  • Join research studies
                                  <br />
                                  • Complete behavioral tasks
                                  <br />• Help advance scientific research
                                </div>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Continue to CogniLab"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </PrivateRoute>
  );
}
