// src/components/profile/BuyerProfile.tsx
"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUI } from "@/store/ui";
import { useBuyerStore } from "@/store/buyer";
import BackButton from "@/components/common/BackButton";

export default function BuyerProfile() {
  const { activeModal, closeModal } = useUI() as any;
  const open = activeModal === "buyerProfile";
  const { profile, setProfile, reset } = useBuyerStore();

  return (
    <Sheet open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader className="sticky top-0 z-10 -mx-6 -mt-6 bg-white/5 p-6 pb-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <BackButton onClick={() => closeModal()} />
            <SheetTitle>Профиль покупателя</SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <Input placeholder="Компания" value={profile.company ?? ""} onChange={(e) => setProfile({ company: e.target.value })} />
          <Input placeholder="Контактное лицо" value={profile.contact ?? ""} onChange={(e) => setProfile({ contact: e.target.value })} />
          <Input placeholder="Телефон" value={profile.phone ?? ""} onChange={(e) => setProfile({ phone: e.target.value })} />
          <Input type="email" placeholder="Email" value={profile.email ?? ""} onChange={(e) => setProfile({ email: e.target.value })} />
          <Input placeholder="Доставка (город/условия)" value={profile.delivery ?? ""} onChange={(e) => setProfile({ delivery: e.target.value })} />
          <Textarea placeholder="Заметки/реквизиты" value={profile.notes ?? ""} onChange={(e) => setProfile({ notes: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button onClick={() => closeModal()}>Готово</Button>
            <Button variant="ghost" onClick={() => reset()}>Сбросить</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
