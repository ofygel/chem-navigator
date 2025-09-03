// src/components/overlays/CartSheet.tsx
"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUI } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CartSheet() {
  const { activeModal, closeModal, cart, setQty, removeFromCart, clearCart } = useUI();
  const open = activeModal === "cart";
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return (
    <Sheet open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <SheetContent side="right" className="w-[420px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>Корзина</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          {cart.length === 0 && <p className="text-sm text-white/70">Корзина пуста.</p>}

          {cart.map((c) => (
            <div key={c.id + c.seller} className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="text-sm font-medium">{c.title}</div>
              <div className="mt-1 text-xs text-white/70">Поставщик: {c.seller}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm tabular-nums">
                  {c.price.toLocaleString("ru-RU")} {c.currency ?? "₽"}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={c.qty}
                    className="h-8 w-16"
                    onChange={(e) => setQty(c.id, c.seller, Math.max(1, Number(e.target.value)))}
                  />
                  <Button variant="ghost" onClick={() => removeFromCart(c.id, c.seller)}>
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {cart.length > 0 && (
            <>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div className="text-sm text-white/90">Итого</div>
                <div className="text-base tabular-nums font-medium">{total.toLocaleString("ru-RU")} ₽</div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl bg-brand.cyan/20 text-brand.cyan hover:bg-brand.cyan/30">
                  Оформить
                </Button>
                <Button variant="ghost" onClick={clearCart}>
                  Очистить
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
