'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FlaskRound, 
  Factory, 
  Construction, 
  Home, 
  ShieldAlert,
  Microscope,
  ArrowRight,
  LucideIcon
} from 'lucide-react';

// Добавляем интерфейс для категории
export interface Category {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  count: string;
}

// Добавляем интерфейс для пропсов компонента
interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Категории продуктов
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Все необходимое для вашей лаборатории, производства или бытовых нужд
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Link href={category.href}>
                <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${category.gradient} text-white mb-6 group-hover:scale-110 transition-transform`}>
                    <category.icon size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 flex-grow">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-medium text-gray-500">
                      {category.count}
                    </span>
                    <div className="flex items-center space-x-2 text-blue-600 group-hover:text-blue-700">
                      <span className="text-sm font-medium">Подробнее</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            href="/catalog"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <span>Смотреть весь каталог</span>
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;