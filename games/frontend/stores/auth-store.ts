"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import pb from "@/lib/pb";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verified?: boolean;
  role?: string | null;
  [key: string]: any;
}

interface ProfileRecord {
  collectionId: string;
  collectionName: string;
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  verified?: boolean;
  user_created?: string;
  user_updated?: string;
  user_data_id?: string;
  role?: string | null;
  consent?: boolean;
  consent_date?: string;
  profile_created?: string;
  profile_updated?: string;
  organization?: OrganizationResponse | null;
}

export interface OrganizationMember {
  avatar: string;
  collectionId: string;
  collectionName: string;
  created: string;
  emailVisibility: boolean;
  id: string;
  name: string;
  updated: string;
  email?: string;
  verified?: boolean;
}

export interface OrganizationData {
  name: string;
  description: string | null;
}

export interface OrganizationRecord {
  collectionId: string;
  collectionName: string;
  created: string;
  data: OrganizationData;
  expand: {
    created_by: OrganizationMember;
    members: OrganizationMember[];
  };
  id: string;
  join_code: string;
  members: string[];
  updated: string;
}

export interface OrganizationResponse {
  items: OrganizationRecord[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  hasRole: boolean;
  roleCheckLoading: boolean;
  profile: ProfileRecord | null;
  profileLoading: boolean;
  profileLoaded: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  checkVerification: () => Promise<boolean>;
  loadProfile: () => Promise<ProfileRecord | null>;
  setLoading: (loading: boolean) => void;
  getOrganization: () => Promise<OrganizationResponse | null>;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    loading: true,
    isAuthenticated: false,
    isVerified: false,
    hasRole: false,
    roleCheckLoading: false,
    profile: null,
    profileLoading: false,
    profileLoaded: false,

    setLoading: (loading: boolean) => set({ loading }),

    getOrganization: async () => {
      try {
        const response = await pb.collection("organizations").getList(1, 1, {
          expand: "members,created_by",
        });
        const org = response as OrganizationResponse;
        set({
          profile: {
            ...get().profile as ProfileRecord,
            organization: org,
          },
        });
        return response as OrganizationResponse;
        
      } catch (error) {
        console.error("Failed to get organization:", error);
        return null;
      }
    },

    checkAuth: () => {
      if (pb.authStore.isValid) {
        const user = pb.authStore.model as unknown as User;
        set({
          user,
          isAuthenticated: true,
          isVerified: user?.verified || false,
          loading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isVerified: false,
          loading: false,
        });
      }
    },

    checkVerification: async () => {
      if (!pb.authStore.isValid) {
        return false;
      }

      try {
        await pb.collection("users").authRefresh();
        const user = pb.authStore.record as unknown as User;
        const verified = user?.verified || false;

        set({
          user,
          isVerified: verified,
        });

        return verified;
      } catch (error) {
        console.error("Failed to check verification status:", error);
        return false;
      }
    },

    loadProfile: async () => {
      if (!pb.authStore.isValid) {
        return null;
      }

      const { profileLoaded, profile } = get();
      if (profileLoaded && profile) {
        return profile;
      }

      set({ profileLoading: true });
      try {
        const userId = pb.authStore.model?.id;
        if (!userId) {
          set({ profileLoading: false, profileLoaded: true, profile: null });
          return null;
        }

        const record = (await pb
          .collection("profile")
          .getOne(userId)) as unknown as ProfileRecord;
        const verified = record?.verified || false;
        const hasRole = record?.role !== null && record?.role !== undefined;

        set({
          profile: record,
          profileLoading: false,
          profileLoaded: true,
          // keep these in sync so consumers don't need to re-check
          isVerified: verified,
          hasRole,
        });
        console.log(record)

        return record;
      } catch (error) {
        console.error("Failed to load profile:", error);
        set({ profileLoading: false, profileLoaded: true, profile: null });
        return null;
      }
    },

    login: async (email: string, password: string) => {
      set({ loading: true });
      try {
        const authData = await pb
          .collection("users")
          .authWithPassword(email, password);
        const user = authData.record as unknown as User;
        set({
          user,
          isAuthenticated: true,
          isVerified: user?.verified || false,
          loading: false,
          // reset profile cache on new session; it will lazy-load when needed
          profile: null,
          profileLoaded: false,
          profileLoading: false,
        });
      } catch (error) {
        console.error("Login failed:", error);
        set({ loading: false });
        throw error;
      }
    },

    logout: () => {
      pb.authStore.clear();
      set({
        user: null,
        isAuthenticated: false,
        isVerified: false,
        hasRole: false,
        roleCheckLoading: false,
        loading: false,
        profile: null,
        profileLoaded: false,
        profileLoading: false,
      });
    },
  }))
);
