// src/components/overlays/ContactsDialog.tsx
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUI } from "@/store/ui";
import BackButton from "@/components/common/BackButton";

export default function ContactsDialog() {
  const { activeModal, closeModal } = useUI();
  const open = activeModal === "contacts";

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <DialogContent className="p-0">
        {/* Шапка с кнопкой Назад */}
        <DialogHeader className="sticky top-0 z-10 bg-white/5 p-6 backdrop-blur-xl text-left">
          <div className="flex items-start gap-2">
            <BackButton onClick={() => closeModal()} />
            <div>
              <DialogTitle>Контакты Chem-Navigator</DialogTitle>
              <DialogDescription>Свяжитесь с нами любым удобным способом</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 p-6 text-sm">
          <p>Телефон: +7 (777) 000-00-00</p>
          <p>Email: contact@chem-navigator.kz</p>
          <p>Адрес: Алматы, …</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
