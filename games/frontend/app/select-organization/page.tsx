"use client";

import type React from "react";
import { useState } from "react";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import pb from "@/lib/pb";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { PrivateRoute } from "@/components/auth/private-route";
import {
  Building2,
  Users,
  Plus,
  Hash,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { OrganizationResponse, useAuthStore } from "@/stores/auth-store";

const createOrgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  description: z.string().optional(),
});

const joinOrgSchema = z.object({
  code: z.string().min(6, "Organization code must be at least 6 characters"),
});

type CreateOrgFormData = z.infer<typeof createOrgSchema>;
type JoinOrgFormData = z.infer<typeof joinOrgSchema>;

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const { getOrganization, profile } = useAuthStore();

  const createForm = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const joinForm = useForm<JoinOrgFormData>({
    resolver: zodResolver(joinOrgSchema),
    defaultValues: {
      code: "",
    },
  });

  const onCreateOrganization = async (data: CreateOrgFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Create organization
      const payload = {
        created_by: user.id,
        data: {
          name: data.name,
          description: data.description || "",
        },
        members: [],
      };
      await pb.collection("organizations").create(payload);
      await getOrganization();
      toast.success("Organization created successfully!");
      
      // Redirect based on user role
      if (profile?.role === "volunteer") {
        router.push("/participant");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
      toast.error("Failed to create organization. Please try again.");
    }
    setLoading(false);
  };

  const onJoinOrganization = async (data: JoinOrgFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await pb.collection("organizations").getList(1,1,{
        join_code: data.code,
      }) as OrganizationResponse;
      const org = res.items[0];
      org.members.push(user.id);
      await pb.collection("organizations").update(org.id, org,{
        join_code: org.join_code,
      });
      await getOrganization();
      toast.success("Successfully joined organization!");
      
      // Redirect based on user role
      if (profile?.role === "volunteer") {
        router.push("/participant");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to join organization:", error);
      toast.error("Failed to join organization. Please try again.");
    }
    setLoading(false);
  };

  return (
    <PrivateRoute>
      <main className="flex min-h-[calc(100svh-56px)] items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Account
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Organization</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    3
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Dashboard
                </span>
              </div>
            </div>
          </div>

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
                Welcome to your research journey
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                {user?.name ? `Hi ${user.name.split(" ")[0]}! ` : ""}Let's set
                up your organization to start collaborating with your research
                team.
              </p>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm ring-1 ring-border/50">
            <CardHeader className="pb-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Choose Your Organization
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Organizations are the foundation of collaborative research.
                    Choose to create a new one or join an existing team to start
                    your experiments.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/30 p-1">
                  <TabsTrigger
                    value="create"
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Create New</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="join"
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Join Existing</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="mt-6">
                  <Form {...createForm}>
                    <form
                      className="space-y-4"
                      onSubmit={createForm.handleSubmit(onCreateOrganization)}
                    >
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter organization name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Brief description of your organization"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              You'll be the admin
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              As the creator, you'll have full control over the
                              organization and can invite other researchers to
                              join.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full cursor-pointer"
                      >
                        {loading ? "Creating..." : "Create Organization"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="join" className="mt-6">
                  <Form {...joinForm}>
                    <form
                      className="space-y-4"
                      onSubmit={joinForm.handleSubmit(onJoinOrganization)}
                    >
                      <FormField
                        control={joinForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Code</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Enter organization code"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              Get the code from your team
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Ask your organization admin for the invitation
                              code to join their research team.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full cursor-pointer"
                      >
                        {loading ? "Joining..." : "Join Organization"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </PrivateRoute>
  );
}
