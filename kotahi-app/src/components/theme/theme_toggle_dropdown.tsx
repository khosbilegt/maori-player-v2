"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as Element;
        if (!target.closest(".theme-dropdown")) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      case "dark":
        return <Moon className="h-[1.2rem] w-[1.2rem]" />;
      default:
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "System";
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative group theme-dropdown">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getThemeIcon()}
        <span className="hidden sm:inline text-sm">{getThemeLabel()}</span>
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Dropdown menu */}
      <div
        className={`absolute right-0 mt-2 w-32 bg-popover border border-border rounded-md shadow-lg transition-all duration-200 z-50 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="py-1">
          <button
            onClick={() => handleThemeChange("light")}
            className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${
              theme === "light" ? "bg-accent text-accent-foreground" : ""
            }`}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
          <button
            onClick={() => handleThemeChange("dark")}
            className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${
              theme === "dark" ? "bg-accent text-accent-foreground" : ""
            }`}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
          <button
            onClick={() => handleThemeChange("system")}
            className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${
              theme === "system" ? "bg-accent text-accent-foreground" : ""
            }`}
          >
            <Monitor className="h-4 w-4" />
            System
          </button>
        </div>
      </div>
    </div>
  );
}
