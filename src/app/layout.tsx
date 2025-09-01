// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import CartSheet from "@/components/overlays/CartSheet";
import ProfileSheet from "@/components/overlays/ProfileSheet";
import ContactsDialog from "@/components/overlays/ContactsDialog";
import ProductDialog from "@/components/overlays/ProductDialog";
import CategoryOverlay from "@/components/overlays/CategoryOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chem-Navigator — Навигатор химических продуктов",
  description: "Профессиональный маркетплейс химических продуктов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {children}
        {/* SPA-оверлеи на всём приложении */}
        <CartSheet />
        <ProfileSheet />
        <ContactsDialog />
        <CategoryOverlay />
        <ProductDialog />
      </body>
    </html>
  );
}
