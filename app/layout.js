"use client";
import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import SplashCursor from "@/components/SplashCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    // Ainult desktopil näita SplashCursorit
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;
    setShowCursor(!isTouchDevice);
  }, []);

  return (
    <html lang="et">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {showCursor && <SplashCursor />}
        {children}
      </body>
    </html>
  );
}
