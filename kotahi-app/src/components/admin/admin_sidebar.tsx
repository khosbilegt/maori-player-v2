"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, LayoutDashboard, Play, WholeWord, List } from "lucide-react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard />,
  },
  {
    title: "Videos",
    href: "/admin/videos",
    icon: <Play />,
  },
  {
    title: "Playlists",
    href: "/admin/playlists",
    icon: <List />,
  },
  {
    title: "Vocabulary",
    href: "/admin/vocabulary",
    icon: <WholeWord />,
  },
  {
    title: "Subtitles",
    href: "/admin/subtitles",
    icon: <FileText />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-6">
          Admin Panel
        </h2>
        <nav className="space-y-2">
          {adminNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  pathname === item.href && "bg-primary text-primary-foreground"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
