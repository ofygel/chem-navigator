// src/components/profile/ProfileHub.tsx
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/store/ui";
import { User, Store, Shield } from "lucide-react";
import BackButton from "@/components/common/BackButton";

export default function ProfileHub() {
  const { activeModal, openModal, closeModal } = useUI() as any;
  const open = activeModal === "profile";

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? closeModal?.() : null)}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="sticky top-0 z-10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BackButton onClick={() => closeModal?.()} />
              <DialogTitle>Личный кабинет</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          <button
            onClick={() => openModal?.("buyerProfile")}
            className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 hover:bg-white/8"
          >
            <User className="mb-2 h-6 w-6 opacity-70" />
            <div className="font-medium">Покупатель</div>
            <div className="text-xs text-white/60">Профиль, реквизиты, история заявок</div>
          </button>

          <button
            onClick={() => openModal?.("sellerDashboard")}
            className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 hover:bg-white/8"
          >
            <Store className="mb-2 h-6 w-6 opacity-70" />
            <div className="font-medium">Продавец</div>
            <div className="text-xs text-white/60">Товары, цены, наличие</div>
          </button>

          <button
            onClick={() => openModal?.("adminPanel")}
            className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 hover:bg-white/8"
          >
            <Shield className="mb-2 h-6 w-6 opacity-70" />
            <div className="font-medium">Админ</div>
            <div className="text-xs text-white/60">Справочники, настройки</div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
