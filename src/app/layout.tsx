import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KenyaHomes - Find Your Perfect Property in Kenya",
  description: "Browse thousands of verified real estate listings in Kenya. Find apartments, houses, land, and commercial properties from trusted agents.",
  keywords: "Kenya real estate, property listings, apartments for rent, houses for sale, land for sale, Nairobi, Mombasa, Kisumu",
  openGraph: {
    title: "KenyaHomes - Find Your Perfect Property in Kenya",
    description: "Browse thousands of verified real estate listings in Kenya",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
