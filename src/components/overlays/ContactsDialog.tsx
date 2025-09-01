// src/components/overlays/ContactsDialog.tsx
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/store/ui";

export default function ContactsDialog() {
  const { activeModal, closeModal } = useUI();
  const open = activeModal === "contacts";
  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Контакты Chem Navigator</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p>Телефон: +7 (777) 000-00-00</p>
          <p>Email: contact@chem-navigator.kz</p>
          <p>Адрес: Алматы, …</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
