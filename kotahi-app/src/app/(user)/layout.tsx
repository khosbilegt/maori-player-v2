import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import ProtectedRoute from "@/components/protected_route";

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export default UserLayout;

export const metadata: Metadata = {
  title: "Tokotoko - Maori Learning Platform",
  description:
    "Tokotoko is a platform for learning Maori language and culture.",
  keywords: ["Maori", "Language", "Culture", "Learning", "Platform"],
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://tokotoko.app",
    title: "Tokotoko - Maori Learning Platform",
    description:
      "Tokotoko is a platform for learning Maori language and culture.",
    images: ["https://tokotoko.app/home.png"],
  },
  twitter: {
    title: "Tokotoko - Maori Learning Platform",
    description:
      "Tokotoko is a platform for learning Maori language and culture.",
    card: "summary_large_image",
    images: ["https://tokotoko.app/home.png"],
  },
};
