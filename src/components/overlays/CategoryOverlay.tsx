// src/components/overlays/CategoryOverlay.tsx
"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useUI } from "@/store/ui";
import { findCategory } from "@/data/catalog";
import ProductTile from "@/components/catalog/ProductTile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

function CategoryBody() {
  const { selectedCategory } = useUI();
  const category = selectedCategory ? findCategory(selectedCategory as any) : undefined;

  return (
    <Tabs defaultValue="popular" className="mt-4">
      <TabsList>
        <TabsTrigger value="popular">Популярное</TabsTrigger>
        <TabsTrigger value="all">Все товары</TabsTrigger>
        <TabsTrigger value="filters">Фильтры</TabsTrigger>
      </TabsList>

      <TabsContent value="popular" className="mt-4">
        <ScrollArea className="h-[52vh]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {category?.products.slice(0, 8).map((p) => (
              <ProductTile key={p.id} id={p.id} title={p.title} image={p.image} purity={p.purity} volume={p.volume} />
            ))}
            {(!category || category.products.length === 0) && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/80">
                Пока нет товаров. Скоро добавим.
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="all" className="mt-4">
        <ScrollArea className="h-[52vh]">
          <div className="grid auto-rows-fr grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {category?.products.map((p) => (
              <ProductTile key={p.id} id={p.id} title={p.title} image={p.image} purity={p.purity} volume={p.volume} />
            ))}
            {(!category || category.products.length === 0) && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/80">
                Нет позиций в этой категории.
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="filters" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">Чистота / ГОСТ / ТУ</div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">Фасовка / Поставщик</div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function CategoryOverlay() {
  const { activeModal, closeModal, selectedCategory } = useUI();
  const isMobile = useIsMobile();
  const open = activeModal === "category";
  const cat = selectedCategory ? findCategory(selectedCategory as any) : undefined;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader className="text-left">
            <SheetTitle>{cat?.title ?? "Категория"}</SheetTitle>
            <SheetDescription>{cat?.desc}</SheetDescription>
          </SheetHeader>
          <CategoryBody />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <DialogContent className="max-w-5xl border-white/10 bg-black/60 backdrop-blur">
        <DialogHeader className="text-left">
          <DialogTitle>{cat?.title ?? "Категория"}</DialogTitle>
          <DialogDescription>{cat?.desc}</DialogDescription>
        </DialogHeader>
        <CategoryBody />
      </DialogContent>
    </Dialog>
  );
}
