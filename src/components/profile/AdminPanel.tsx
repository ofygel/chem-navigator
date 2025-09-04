// src/components/profile/AdminPanel.tsx
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/store/ui";
import { useAdminStore } from "@/store/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { staticSellers } from "@/data/sellers";
import { Trash } from "lucide-react";
import * as React from "react";
import BackButton from "@/components/common/BackButton";

export default function AdminPanel() {
  const { activeModal, closeModal } = useUI() as any;
  const open = activeModal === "adminPanel";
  const { sellers, upsertSeller, removeSeller, reset } = useAdminStore();

  const [id, setId] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [telegram, setTelegram] = React.useState("");

  const merged = { ...staticSellers, ...sellers };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="sticky top-0 z-10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BackButton onClick={() => closeModal()} />
              <DialogTitle>Админ-панель</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="text-sm text-white/70">Добавить/обновить продавца</div>
            <Input placeholder="id (латиница, уникально)" value={id} onChange={(e) => setId(e.target.value)} />
            <Input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Telegram" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!id.trim() || !name.trim()) return;
                  upsertSeller({ id: id.trim(), name: name.trim(), email, phone, telegram });
                  setId(""); setName(""); setEmail(""); setPhone(""); setTelegram("");
                }}
              >
                Сохранить
              </Button>
              <Button variant="ghost" onClick={() => reset()}>Сбросить мои правки</Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-white/70">Все продавцы (статик + локальные)</div>
            <div className="max-h-[50vh] space-y-2 overflow-auto">
              {Object.values(merged).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-white/60">
                      {s.id} · {s.email ?? "-"} · {s.phone ?? "-"} {s.telegram ? `· ${s.telegram}` : ""}
                    </div>
                  </div>
                  {!staticSellers[s.id] && (
                    <button
                      className="rounded-lg p-2 hover:bg-white/10"
                      onClick={() => removeSeller(s.id)}
                      title="Удалить"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
