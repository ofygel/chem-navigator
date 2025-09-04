// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import ContactsDialog from "@/components/overlays/ContactsDialog";
import ProductDialog from "@/components/overlays/ProductDialog";
import ProfileSheet from "@/components/overlays/ProfileSheet";
import CartSheet from "@/components/overlays/CartSheet";
import CategoryOverlay from "@/components/overlays/CategoryOverlay";
import GlobalMolecularField from "@/components/three/GlobalMolecularField";
import CheckoutDialog from "@/components/overlays/CheckoutDialog";
import ProfileHub from "@/components/profile/ProfileHub";
import BuyerProfile from "@/components/profile/BuyerProfile";
import SellerDashboard from "@/components/profile/SellerDashboard";
import AdminPanel from "@/components/profile/AdminPanel";

export const metadata: Metadata = {
  title: "Chem-Navigator",
  description: "Маркетплейс химических продуктов",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#0d0f1a] text-white antialiased">
        {/* Глобальный 3D-фон — один Canvas на весь сайт */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <GlobalMolecularField />
        </div>

        {/* Весь контент поверх 3D */}
        <div className="relative z-10">
          <Header />
          {children}
          {/* SPA-оверлеи */}
          <ContactsDialog />
          <ProductDialog />
          <ProfileSheet />
          <CartSheet />
          <CategoryOverlay />
          <CheckoutDialog />
          <ProfileHub />
          <BuyerProfile />
          <SellerDashboard />
          <AdminPanel />
        </div>
      </body>
    </html>
  );
}
