// src/components/category/CategoryGrid.tsx
import CategoryCard from "./CategoryCard";

const items = [
  {
    title: "Лабораторная химия",
    desc: "Реактивы, буферы, индикаторы.",
    href: "/catalog/lab",
    image: "/categories/lab.jpg",
  },
  {
    title: "Промышленная химия",
    desc: "Растворители, смазки, ингибиторы.",
    href: "/catalog/industrial",
    image: "/categories/industrial.jpg",
  },
  {
    title: "Строительная химия",
    desc: "Добавки, адгезивы, растворы.",
    href: "/catalog/construction",
    image: "/categories/construction.jpg",
  },
  {
    title: "Бытовая химия",
    desc: "Очистка, дезинфекция, уход.",
    href: "/catalog/household",
    image: "/categories/household.jpg",
  },
  {
    title: "Подконтрольные вещества",
    desc: "GHS/ADR, ограниченный оборот.",
    href: "/catalog/controlled",
    image: "/categories/controlled.jpg",
  },
  {
    title: "Услуги лаборатории",
    desc: "Аналитика, синтез, испытания.",
    href: "/catalog/services",
    image: "/categories/services.jpg",
  },
];

export default function CategoryGrid() {
  return (
    <div
      className="
        mx-auto grid w-full max-w-7xl gap-5
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {items.map((it) => (
        <CategoryCard
          key={it.href}
          {...it}
          className="h-[180px] sm:h-[220px] lg:h-[240px]"
        />
      ))}
    </div>
  );
}
