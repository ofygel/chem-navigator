// src/components/overlays/ProfileSheet.tsx
"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUI } from "@/store/ui";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";

export default function ProfileSheet() {
  const { activeModal, closeModal } = useUI();
  const open = activeModal === "profile";

  return (
    <Sheet open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px]">
        <SheetHeader className="sticky top-0 z-10 -mx-6 -mt-6 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <BackButton onClick={() => closeModal()} />
            <SheetTitle>Профиль</SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-3 text-sm text-white/80">
          <p>Авторизация не выполнена. Войдите, чтобы увидеть заказы и избранное.</p>
          <Button onClick={closeModal} className="mt-4">
            Закрыть
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
