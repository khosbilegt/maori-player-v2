import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./store_provider";
import { ThemeProvider } from "@/components/theme/theme_provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            {children}
            <Toaster position="top-center" />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
