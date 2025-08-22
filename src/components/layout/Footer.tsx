import Link from 'next/link';
import { FlaskRound, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                <FlaskRound size={28} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl">CHEM-NAVIGATOR</span>
                <span className="text-sm text-blue-300">Навигатор химических продуктов</span>
              </div>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Крупнейший маркетплейс химических продуктов в Казахстане. 
              Более 50,000 продуктов от проверенных поставщиков.
            </p>
            <div className="flex space-x-4">
              {['Twitter', 'LinkedIn', 'Telegram'].map((social) => (
                <button
                  key={social}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="text-sm font-medium">{social[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="font-bold text-lg mb-6">Категории</h3>
            <ul className="space-y-3">
              {[
                'Лабораторная химия',
                'Промышленная химия',
                'Строительная химия',
                'Бытовая химия',
                'Подконтрольные вещества',
                'Оборудование'
              ].map((category) => (
                <li key={category}>
                  <Link
                    href={`/catalog/${category.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-bold text-lg mb-6">Компания</h3>
            <ul className="space-y-3">
              {[
                'О нас',
                'Для поставщиков',
                'Для корпоративных клиентов',
                'Вакансии',
                'Новости',
                'Блог'
              ].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-bold text-lg mb-6">Контакты</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Телефон</p>
                  <p className="text-gray-300">+7 (777) 125 35 92</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-300">info@chem-navigator.kz</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Адрес</p>
                  <p className="text-gray-300">Алматы, ул. Химическая, 15</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} CHEM-NAVIGATOR. Все права защищены.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Условия использования
            </Link>
            <Link href="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
              Карта сайта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;