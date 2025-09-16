"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggleDropdown } from "@/components/theme/theme_toggle_dropdown";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <nav
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  K
                </span>
              </div>
              <span className="font-bold text-xl">Kotahi</span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggleDropdown />
            {user ? (
              <>
                <Link href="/library" className="text-sm text-primary">
                  My library
                </Link>
                <Link href="/watch-list" className="text-sm text-primary">
                  Watch List
                </Link>
                <Link href="/learning-list" className="text-sm text-primary">
                  Learning List
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="text-sm text-primary">
                    Admin Panel
                  </Link>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.username}
                </span>
                <Button size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
