"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggleDropdown } from "@/components/ThemeToggleDropdown";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
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
            <Button variant="ghost" size="sm">
              My library
            </Button>
            <Button size="sm">Sign Out</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
