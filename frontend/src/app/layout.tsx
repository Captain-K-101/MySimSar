import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MySimsar - Find Trusted Real Estate Brokers in UAE & GCC",
  description: "The first transparent platform to search, compare, and rate verified real estate brokers. Make confident property decisions with authenticated reviews.",
  keywords: ["real estate", "brokers", "UAE", "Dubai", "GCC", "property", "simsar", "verified", "reviews"],
  openGraph: {
    title: "MySimsar - Find Trusted Real Estate Brokers in UAE & GCC",
    description: "The first transparent platform to search, compare, and rate verified real estate brokers.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
