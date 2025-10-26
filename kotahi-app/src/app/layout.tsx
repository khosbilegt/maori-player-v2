import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./store_provider";
import { ThemeProvider } from "@/components/theme/theme_provider";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/lib/user-context";
import { AnalyticsErrorBoundary } from "@/components/analytics-error-boundary";
import AnalyticsWrapper from "@/components/analytics-wrapper";
export { metadata } from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
            <UserProvider>
              <AnalyticsWrapper>
                <AnalyticsErrorBoundary>
                  {children}
                  <Toaster position="top-center" />
                </AnalyticsErrorBoundary>
              </AnalyticsWrapper>
            </UserProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
