"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useProfile } from "./hooks/api";
import { posthog } from "./posthog";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: profileData, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (profileData) {
      setUser(profileData);
      setIsLoading(false);

      // Identify user with PostHog
      posthog.identify(profileData.id, {
        email: profileData.email,
        username: profileData.username,
        role: profileData.role,
      });
    } else if (!profileLoading) {
      // No profile data and not loading means not authenticated
      setUser(null);
      setIsLoading(false);
    }
  }, [profileData, profileLoading]);

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
