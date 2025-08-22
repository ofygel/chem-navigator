'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, FlaskRound, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import CartIcon from '@/components/cart/CartIcon';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  
  // Получаем состояние корзины
  const { items, clearCart } = useCartStore();
  
  // Вычисляем общее количество товаров
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  const handleQuickAdd = (productName: string) => {
    router.push(`/catalog?search=${encodeURIComponent(productName)}`);
    setIsSearchOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-2xl shadow-blue-500/10'
            : 'bg-gradient-to-b from-blue-900/80 to-transparent'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white"
              >
                <FlaskRound size={28} />
              </motion.div>
              <div className="flex flex-col">
                <span className={`font-bold text-xl lg:text-2xl transition-colors ${isScrolled ? 'text-blue-900' : 'text-white'}`}>
                  CHEM-NAVIGATOR
                </span>
                <span className={`text-xs transition-colors ${isScrolled ? 'text-blue-600' : 'text-blue-200'}`}>
                  Навигатор химических продуктов
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/catalog"
                className={`font-medium transition-colors hover:text-blue-600 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Каталог
              </Link>
              <Link
                href="/industries"
                className={`font-medium transition-colors hover:text-blue-600 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Отрасли
              </Link>
              <Link
                href="/services"
                className={`font-medium transition-colors hover:text-blue-600 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                Услуги
              </Link>
              <Link
                href="/about"
                className={`font-medium transition-colors hover:text-blue-600 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                О компании
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled
                    ? 'hover:bg-gray-100 text-gray-600'
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <Search size={20} />
              </button>
              
              <button
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled
                    ? 'hover:bg-gray-100 text-gray-600'
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <Bell size={20} />
              </button>
              
              <Link
                href="/cart"
                className={`p-2 rounded-lg transition-colors relative ${
                  isScrolled
                    ? 'hover:bg-gray-100 text-gray-600'
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <CartIcon />
              </Link>
              
              <Link
                href="/profile"
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  isScrolled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                Кабинет
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X size={24} className={isScrolled ? 'text-gray-700' : 'text-white'} />
              ) : (
                <Menu size={24} className={isScrolled ? 'text-gray-700' : 'text-white'} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t"
            >
              <div className="container mx-auto px-4 py-4">
                <nav className="flex flex-col space-y-4">
                  <Link 
                    href="/catalog" 
                    className="font-medium text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Каталог
                  </Link>
                  <Link 
                    href="/industries" 
                    className="font-medium text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Отрасли
                  </Link>
                  <Link 
                    href="/services" 
                    className="font-medium text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Услуги
                  </Link>
                  <Link 
                    href="/about" 
                    className="font-medium text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    О компании
                  </Link>
                  <div className="flex space-x-4 pt-4">
                    <button 
                      className="p-2 rounded-lg bg-gray-100 text-gray-600"
                      onClick={() => {
                        setIsSearchOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Search size={20} />
                    </button>
                    <Link 
                      href="/cart" 
                      className="p-2 rounded-lg bg-gray-100 text-gray-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CartIcon />
                    </Link>
                    <Link 
                      href="/profile" 
                      className="p-2 rounded-lg bg-gray-100 text-gray-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={20} />
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white mx-4 mt-20 lg:mx-auto lg:max-w-2xl rounded-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  name="search"
                  type="text"
                  placeholder="Поиск по CAS, названию или производителю..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </form>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Популярные запросы:</h4>
                <div className="flex flex-wrap gap-2">
                  {['Этанол', 'Соляная кислота', 'Перекись водорода', 'Ацетон'].map((item) => (
                    <button
                      key={item}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      onClick={() => handleQuickAdd(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;