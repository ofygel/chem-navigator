'use client';

import Hero from '@/components/sections/Hero';
import CategoryGrid from '@/components/category/CategoryGrid';
import { useCategories } from '@/hooks/useCategories';
import { 
  FlaskRound, 
  Factory, 
  Construction, 
  Home as HomeIcon, 
  ShieldAlert,
  Microscope,
  LucideIcon
} from 'lucide-react';

// Интерфейс для категорий (должен соответствовать интерфейсу в CategoryGrid)
interface Category {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  count: string;
}

const defaultCategories: Category[] = [
  {
    id: 1,
    title: 'Лабораторная химия',
    description: 'Реактивы, растворители и оборудование для научных исследований',
    icon: FlaskRound,
    href: '/catalog/laboratory',
    gradient: 'from-blue-500 to-cyan-500',
    count: '2,400+ продуктов'
  },
  {
    id: 2,
    title: 'Промышленная химия',
    description: 'Сырье и материалы для производственных процессов',
    icon: Factory,
    href: '/catalog/industrial',
    gradient: 'from-purple-500 to-pink-500',
    count: '15,000+ продуктов'
  },
  {
    id: 3,
    title: 'Строительная химия',
    description: 'Специализированные составы для строительной отрасли',
    icon: Construction,
    href: '/catalog/construction',
    gradient: 'from-orange-500 to-red-500',
    count: '8,700+ продуктов'
  },
  {
    id: 4,
    title: 'Бытовая химия',
    description: 'Продукты для дома и повседневного использования',
    icon: HomeIcon,
    href: '/catalog/household',
    gradient: 'from-green-500 to-emerald-500',
    count: '12,000+ продуктов'
  },
  {
    id: 5,
    title: 'Подконтрольные вещества',
    description: 'Специальные категории с соблюдением всех требований',
    icon: ShieldAlert,
    href: '/catalog/controlled',
    gradient: 'from-red-500 to-rose-500',
    count: '900+ продуктов'
  },
  {
    id: 6,
    title: 'Лабораторное оборудование',
    description: 'Техника и приборы для современных лабораторий',
    icon: Microscope,
    href: '/catalog/equipment',
    gradient: 'from-indigo-500 to-blue-500',
    count: '5,300+ продуктов'
  }
];

export default function HomePage() {
  const { categories, loading, error } = useCategories();

  // Преобразуем категории из API к нужному формату
  const transformedCategories = categories?.map((apiCategory: any) => ({
    id: apiCategory.id,
    title: apiCategory.name || apiCategory.title,
    description: apiCategory.description,
    icon: getIconComponent(apiCategory.iconName),
    href: `/catalog/${apiCategory.slug}`,
    gradient: getGradient(apiCategory.type),
    count: `${apiCategory.productCount || 0}+ продуктов`
  })) || [];

  // Используем преобразованные категории из API или дефолтные
  const displayCategories = transformedCategories.length > 0 ? transformedCategories : defaultCategories;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Hero />

      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Категории продуктов
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Найдите всё необходимое для вашей лаборатории, производства или бытовых нужд
          </p>
        </div>

        {loading && <div className="text-center text-gray-500">Загрузка...</div>}
        {error && (
          <div className="text-center text-red-600">
            Ошибка загрузки данных. Показаны стандартные категории.
          </div>
        )}
        <CategoryGrid categories={displayCategories} />
      </section>

      {/* Здесь будут другие секции: FeaturedProducts, Suppliers, Testimonials, etc. */}
    </main>
  );
}

// Вспомогательные функции для преобразования данных из API
function getIconComponent(iconName: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    'flask-round': FlaskRound,
    'factory': Factory,
    'construction': Construction,
    'home': HomeIcon,
    'shield-alert': ShieldAlert,
    'microscope': Microscope,
  };
  
  return iconMap[iconName] || FlaskRound;
}

function getGradient(type: string): string {
  const gradientMap: Record<string, string> = {
    'laboratory': 'from-blue-500 to-cyan-500',
    'industrial': 'from-purple-500 to-pink-500',
    'construction': 'from-orange-500 to-red-500',
    'household': 'from-green-500 to-emerald-500',
    'controlled': 'from-red-500 to-rose-500',
    'equipment': 'from-indigo-500 to-blue-500',
  };
  
  return gradientMap[type] || 'from-gray-500 to-gray-700';
}