// клиентский компонент
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
}

const CategoryCard = ({ title, description, image, href }: CategoryCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <Link href={href}>
        <div className="relative h-56 w-full overflow-hidden">
          {/* затемнение + градиент */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />

          {/* временная заглушка (первая буква категории) */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold opacity-80">
              {title.charAt(0)}
            </span>
          </div>

          {/* текст на фоне */}
          <div className="absolute bottom-4 left-4 z-20 text-white">
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-blue-100 opacity-90">{description}</p>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-b from-white to-blue-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600">Подробнее</span>
            <svg
              className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
