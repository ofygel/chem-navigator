// src/components/category/CategoryGrid.tsx
import CategoryCard from "./CategoryCard";

const items = [
  { title: "Лабораторная химия", desc: "Реактивы, буферы, индикаторы.", slug: "lab",         image: "/categories/lab.jpg" },
  { title: "Промышленная химия",  desc: "Растворители, смазки, ингибиторы коррозии.",        slug: "industrial",  image: "/categories/industrial.jpg" },
  { title: "Строительная химия",  desc: "Добавки, адгезивы, растворы для строительной индустрии.", slug: "construction", image: "/categories/construction.jpg" },
  { title: "Бытовая химия",       desc: "Очистка, дезинфекция, уход.",                       slug: "household",   image: "/categories/household.jpg" },
  { title: "Подконтрольные вещества", desc: "GHS/ADR, ограниченный оборот.",                 slug: "controlled",  image: "/categories/controlled.jpg" },
  { title: "Услуги лаборатории",  desc: "Аналитика, синтез, испытания.",                     slug: "services",    image: "/categories/services.jpg" },
];

export default function CategoryGrid() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <CategoryCard key={it.slug} {...it} className="h-[180px] sm:h-[220px] lg:h-[240px]" />
      ))}
    </div>
  );
}
