import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tokotoko.app";

export const metadata: Metadata = {
  title: "Tokotoko - Maori Learning Platform",
  description:
    "Tokotoko is a platform for learning Maori language and culture.",
  keywords: ["Maori", "Language", "Culture", "Learning", "Platform"],
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Tokotoko - Maori Learning Platform",
    description:
      "Tokotoko is a platform for learning Maori language and culture.",
    images: [`${siteUrl}/home.png`],
  },
  twitter: {
    title: "Tokotoko - Maori Learning Platform",
    description:
      "Tokotoko is a platform for learning Maori language and culture.",
    card: "summary_large_image",
    images: [`${siteUrl}/home.png`],
  },
};
