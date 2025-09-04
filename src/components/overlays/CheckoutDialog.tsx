// src/components/overlays/CheckoutDialog.tsx
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUI } from "@/store/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sellerDirectory } from "@/data/sellers";
import React from "react";
import BackButton from "@/components/common/BackButton";

export default function CheckoutDialog() {
  const { activeModal, closeModal, cart, clearCart } = useUI();
  const open = activeModal === "checkout";

  const [company, setCompany] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [delivery, setDelivery] = React.useState("Самовывоз / обсуждается");
  const [comment, setComment] = React.useState("");
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  function makeSummary() {
    const lines = [
      `Компания: ${company}`,
      `Контакт: ${contact}`,
      `Телефон: ${phone}`,
      `Email: ${email}`,
      `Доставка: ${delivery}`,
      "",
      "Позиции:",
      ...cart.map(c => `• ${c.title} — ${c.qty} шт · ${c.price} ${c.currency ?? "₽"} / ${c.seller}`),
      "",
      `Итого: ${total.toLocaleString("ru-RU")} ${cart[0]?.currency ?? "₽"}`,
      comment ? "\nКомментарий:\n" + comment : "",
    ];
    return lines.join("\n");
  }

  async function submit() {
    const text = makeSummary();
    try {
      await navigator.clipboard.writeText(text);
      alert("Заявка скопирована в буфер обмена. Вставьте в письмо/мессенджер и отправьте продавцу.");
    } catch {
      alert("Скопируйте заявку вручную:\n\n" + text);
    }
    clearCart();
    closeModal();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="sticky top-0 z-10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-2">
            <BackButton onClick={() => closeModal()} />
            <div>
              <DialogTitle>Оформление заказа</DialogTitle>
              <DialogDescription>Оставьте контакты — мы передадим их поставщику. Оплата вне сайта.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 p-6 md:grid-cols-5">
          {/* Сводка корзины */}
          <div className="order-2 space-y-3 md:order-1 md:col-span-3">
            <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm text-white/70">Позиции</div>
              <div className="space-y-2">
                {cart.map((c, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
                    <div className="truncate">{c.title}</div>
                    <div className="text-white/70">× {c.qty}</div>
                    <div className="tabular-nums">{(c.price * c.qty).toLocaleString("ru-RU")} {c.currency ?? "₽"}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <div className="text-sm text-white/90">Итого</div>
                <div className="text-base tabular-nums font-medium">{total.toLocaleString("ru-RU")} {cart[0]?.currency ?? "₽"}</div>
              </div>
            </div>

            <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm text-white/70">Контакты продавцов</div>
              <div className="space-y-2">
                {Array.from(new Set(cart.map(c => c.seller))).map((s) => {
                  const info = sellerDirectory[s];
                  return (
                    <div key={s} className="flex items-center justify-between rounded-xl bg-white/4 p-3 ring-1 ring-white/10">
                      <div>
                        <div className="font-medium">{s}</div>
                        <div className="text-xs text-white/60">
                          {info?.email ? `✉ ${info.email}` : ""} {info?.phone ? ` · ☎ ${info.phone}` : ""} {info?.telegram ? ` · TG ${info.telegram}` : ""}
                        </div>
                      </div>
                      {info?.email && (
                        <a
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10"
                          href={`mailto:${info.email}?subject=${encodeURIComponent("Запрос КП — Chem Navigator")}`}
                        >
                          Написать
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Форма */}
          <form className="order-1 space-y-3 md:order-2 md:col-span-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="space-y-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <Input placeholder="Компания" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Input placeholder="Контактное лицо" value={contact} onChange={(e) => setContact(e.target.value)} />
              <Input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Доставка (город/условия)" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
              <Textarea placeholder="Комментарий к заказу / реквизиты / сроки" value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 rounded-xl bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30">Отправить запрос</Button>
              <Button type="button" variant="ghost" onClick={() => closeModal()}>Отмена</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
