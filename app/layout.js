"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

const SplashCursor = dynamic(() => import("@/components/SplashCursor"), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="et">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SplashCursor />
        {children}
      </body>
    </html>
  );
}
