import { useCartItems, useCartTotal } from '@/store/cartStore';

export const CartSummary = () => {
  const items = useCartItems();
  const total = useCartTotal();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Корзина ({items.length} товаров)</h2>
      <p className="text-lg font-semibold">Общая сумма: {total.toLocaleString('ru-RU')} тенге.</p>
    </div>
  );
};