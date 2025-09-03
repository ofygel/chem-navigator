// src/data/catalog.ts
export type Offer = {
  seller: string
  price: number
  currency?: "₸" | "₽" | "$"
  availability: "in-stock" | "backorder"
}

// добавь тип GHS
export type GHS = "flammable" | "toxic" | "irritant" | "environment"

export type Product = {
  id: string
  title: string
  cas?: string
  purity?: number // %
  volume?: string // "300 мл"
  image?: string  // /products/...
  tags?: string[]
  offers: Offer[]
  // в Product добавь hazards
  hazards?: GHS[]
}

export type Category = {
  slug: "lab" | "industrial" | "construction" | "household" | "controlled" | "services"
  title: string
  desc: string
  products: Product[]
}

export const CATALOG: Category[] = [
  {
    slug: "construction",
    title: "Строительная химия",
    desc: "Добавки, адгезивы, растворы для строительной индустрии.",
    products: [
      {
        id: "sealant-300",
        title: "Клей-герметик",
        cas: "63148-62-9",
        purity: 98,
        volume: "300 мл",
        image: "/products/sealant.png",
        tags: ["адгезив", "герметик", "высокая адгезия"],
        offers: [
          { seller: "ZetaChem", price: 4900, currency: "₽", availability: "in-stock" },
          { seller: "Acm Acma Corp", price: 5100, currency: "₽", availability: "backorder" },
          { seller: "Vialabs", price: 5250, currency: "₽", availability: "backorder" },
          { seller: "SYNTHORIA", price: 5300, currency: "₽", availability: "in-stock" },
        ],
      },
      {
        id: "primer-5l",
        title: "Праймер бетонный",
        cas: "8052-41-3",
        purity: 95,
        volume: "5 л",
        image: "/products/primer.png",
        offers: [
          { seller: "BuildChem", price: 8700, currency: "₽", availability: "in-stock" },
          { seller: "SYNTHORIA", price: 9200, currency: "₽", availability: "backorder" },
        ],
      },
      {
        id: "plasticizer-10l",
        title: "Пластификатор",
        cas: "25322-69-4",
        purity: 99,
        volume: "10 л",
        image: "/products/plasticizer.png",
        offers: [
          { seller: "ZetaChem", price: 11500, currency: "₽", availability: "in-stock" },
        ],
      },
    ],
  },
  {
    slug: "industrial",
    title: "Промышленная химия",
    desc: "Растворители, смазки, ингибиторы коррозии.",
    products: [
      {
        id: "inhibitor-a",
        title: "Ингибитор коррозии А",
        cas: "95-14-7",
        purity: 96,
        volume: "1 л",
        image: "/products/inhibitor.png",
        // примеры hazards
        hazards: ["toxic", "irritant"],
        offers: [
          { seller: "Vialabs", price: 12900, currency: "₽", availability: "in-stock" },
        ],
      },
      {
        id: "solvent-646",
        title: "Растворитель 646",
        volume: "5 л",
        image: "/products/solvent.png",
        // примеры hazards
        hazards: ["flammable"],
        offers: [
          { seller: "Acm Acma Corp", price: 2400, currency: "₽", availability: "in-stock" },
        ],
      },
    ],
  },
  {
    slug: "lab",
    title: "Лабораторная химия",
    desc: "Реактивы, буферы, индикаторы.",
    products: [
      {
        id: "acetone-lab",
        title: "Ацетон, ч.д.а.",
        cas: "67-64-1",
        purity: 99.8,
        volume: "1 л",
        image: "/products/acetone.png",
        offers: [
          { seller: "ZetaChem", price: 1900, currency: "₽", availability: "in-stock" },
        ],
      },
    ],
  },
  { slug: "household", title: "Бытовая химия", desc: "Очистка, дезинфекция, уход.", products: [] },
  { slug: "controlled", title: "Подконтрольные вещества", desc: "GHS/ADR, ограниченный оборот.", products: [] },
  { slug: "services", title: "Лабораторные оборудования и услуги", desc: "Аналитика, синтез, испытания.", products: [] },
]

// утилиты поиска по данным
export const findCategory = (slug: Category["slug"]) => CATALOG.find(c => c.slug === slug)
export const findProduct = (id: string) =>
  CATALOG.flatMap(c => c.products.map(p => ({ ...p, category: c }))).find(p => p.id === id)
