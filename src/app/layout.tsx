// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import ContactsDialog from "@/components/overlays/ContactsDialog";
import ProductDialog from "@/components/overlays/ProductDialog";
import ProfileSheet from "@/components/overlays/ProfileSheet";
import CartSheet from "@/components/overlays/CartSheet";
import CategoryOverlay from "@/components/overlays/CategoryOverlay";

export const metadata: Metadata = {
  title: "Chem-Navigator",
  description: "Маркетплейс химических продуктов",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#0d0f1a] text-white antialiased">
        <Header />
        {children}
        {/* SPA-оверлеи */}
        <ContactsDialog />
        <ProductDialog />
        <ProfileSheet />
        <CartSheet />
        <CategoryOverlay />
      </body>
    </html>
  );
}
