import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppI18nProvider } from "@/components/providers/AppI18nProvider";
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
  title: "Cronogestor",
  description: "Gestão inteligente de obras e equipes",
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
        suppressHydrationWarning
      >
        <AppI18nProvider>{children}</AppI18nProvider>
      </body>
    </html>
  );
}
