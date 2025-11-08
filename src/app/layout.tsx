import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { AppLoading } from "@/components/app-loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sambhar Soul - Taste the Tradition | Authentic South Indian Food Delivery",
  description: "Experience authentic South Indian cuisine with Sambhar Soul. Fresh idli, dosa, sambhar, and more delivered hot to your doorstep. Taste the tradition!",
  keywords: ["South Indian", "Food Delivery", "Sambhar", "Idli", "Dosa", "Online Ordering", "Authentic Cuisine"],
  authors: [{ name: "Sambhar Soul" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Sambhar Soul - Taste the Tradition",
    description: "Authentic South Indian cuisine delivered to your doorstep with love",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppLoading />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
