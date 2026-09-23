import type { Metadata } from "next";
import { Inter, Noto_Sans_Telugu } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

// Fonts are self hosted by Next at build time (no runtime Google calls). docs/09, Typography.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  display: "swap",
  variable: "--font-telugu",
});

export const metadata: Metadata = {
  title: { default: "AP TransitOS", template: "%s · AP TransitOS" },
  description: "One connected public transport platform for Andhra Pradesh.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // lang and data-theme come from cookies on Day 3 (docs/adr/005-i18n.md).
  return (
    <html lang="en" className={`${inter.variable} ${notoSansTelugu.variable}`}>
      <body>{children}</body>
    </html>
  );
}
