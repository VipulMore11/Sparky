"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import pb from "@/lib/pb";
import { Loader2, User, Mail, Shield, Bell, Camera } from "lucide-react";

interface ProfileFormData {
  name: string;
  email: string;
  avatar?: string;
  newsletter: boolean;
  consent: boolean;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountPage() {
  const { toast } = useToast();
  const { user, profile, profileLoading, loadProfile, isAuthenticated } =
    useAuthStore();

  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: "",
    email: "",
    avatar: "",
    newsletter: true,
    consent: false,
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getAvatarUrl = (
    avatar: string | undefined,
    userId: string | undefined
  ) => {
    if (avatar && userId) {
      return `https://bitnbuild.anuragpandey.codes/api/files/_pb_users_auth_/${userId}/${avatar}`;
    }
    return undefined;
  };

  // Load profile data on component mount
  useEffect(() => {
    if (isAuthenticated && !profile && !profileLoading) {
      loadProfile();
    }
  }, [isAuthenticated, profile, profileLoading, loadProfile]);

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || user?.name || "",
        email: profile.email || user?.email || "",
        avatar: profile.avatar || user?.avatar || "",
        newsletter: true, // Default to true, can be updated based on your schema
        consent: profile.consent || false,
      });
    } else if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        newsletter: true,
        consent: false,
      });
    }
  }, [profile, user]);

  // Check for changes
  useEffect(() => {
    if (profile) {
      const hasProfileChanges =
        profileData.name !== (profile.name || "") ||
        profileData.email !== (profile.email || "") ||
        profileData.avatar !== (profile.avatar || "") ||
        profileData.consent !== (profile.consent || false);

      setHasChanges(hasProfileChanges);
    }
  }, [profileData, profile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (!isAuthenticated || !user) {
        throw new Error("User not authenticated");
      }

      // Update user record
      await pb.collection("users").update(user.id, {
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar,
      });

      // Update profile record if it exists
      try {
        await pb.collection("profile").update(user.id, {
          name: profileData.name,
          email: profileData.email,
          avatar: profileData.avatar,
          consent: profileData.consent,
        });
      } catch (profileError) {
        // If profile doesn't exist, create it
        await pb.collection("profile").create({
          id: user.id,
          name: profileData.name,
          email: profileData.email,
          avatar: profileData.avatar,
          consent: profileData.consent,
          user_data_id: user.id,
        });
      }

      // Reload profile to get updated data
      await loadProfile();

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      setHasChanges(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      if (!isAuthenticated || !user) {
        throw new Error("User not authenticated");
      }

      // Update password
      await pb.collection("users").update(user.id, {
        oldPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
        passwordConfirm: passwordData.confirmPassword,
      });

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });

      // Clear password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        title: "Password update failed",
        description:
          error.message ||
          "Failed to update password. Please check your current password.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "Avatar image must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const record = await pb
        .collection("users")
        .update(user?.id || "", formData);

      // Update profile data with the new avatar filename
      setProfileData((prev) => ({
        ...prev,
        avatar: record.avatar,
      }));

      toast({
        title: "Avatar updated",
        description: "Your avatar has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <main className="grid gap-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid gap-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={getAvatarUrl(profileData.avatar, user?.id)}
                alt={`${profileData.name} avatar`}
              />
              <AvatarFallback className="text-lg">
                {profileData.name ? getInitials(profileData.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Avatar
                  </span>
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, name: e.target.value }))
                }
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                disabled
                value={profileData.email}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Product updates
                </div>
                <p className="text-sm text-muted-foreground">
                  Get occasional emails about new features
                </p>
              </div>
              <Switch
                checked={profileData.newsletter}
                onCheckedChange={(checked) =>
                  setProfileData((prev) => ({ ...prev, newsletter: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Data consent
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow your data to be used for research purposes
                </p>
              </div>
              <Switch
                checked={profileData.consent}
                onCheckedChange={(checked) =>
                  setProfileData((prev) => ({ ...prev, consent: checked }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (profile) {
                  setProfileData({
                    name: profile.name || user?.name || "",
                    email: profile.email || user?.email || "",
                    avatar: profile.avatar || user?.avatar || "",
                    newsletter: true,
                    consent: profile.consent || false,
                  });
                }
                setErrors({});
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProfileUpdate}
              disabled={!hasChanges || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handlePasswordChange}
              disabled={
                isPasswordLoading ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
            >
              {isPasswordLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Verification</span>
              <div className="flex items-center gap-2">
                {user?.verified ? (
                  <span className="text-green-600 text-sm">Verified</span>
                ) : (
                  <span className="text-yellow-600 text-sm">Pending</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Role</span>
              <div className="flex items-center gap-2">
                {profile?.role ? (
                  <span className="text-blue-600 text-sm capitalize">
                    {profile.role}
                  </span>
                ) : (
                  <span className="text-gray-600 text-sm">
                    No role assigned
                  </span>
                )}
              </div>
            </div>

            {!user?.verified && (
              <Alert>
                <AlertDescription>
                  Your email address is not verified. Please check your email
                  for a verification link.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
