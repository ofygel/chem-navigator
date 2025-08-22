import { CartSummary } from '@/components/cart/CartSummary';
import { CartItemsList } from '@/components/cart/CartItemsList';

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ваша корзина</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItemsList />
        </div>
        
        <div className="lg:col-span-1">
          <CartSummary />
          {/* Дополнительные элементы: кнопка оформления заказа и т.д. */}
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg mt-4 hover:bg-blue-700">
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  );
}