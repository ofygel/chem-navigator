'use client';

import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Данные для заказа</h2>
          {/* Форма заказа */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ФИО</label>
              <input type="text" className="w-full p-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full p-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Телефон</label>
              <input type="tel" className="w-full p-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Адрес доставки</label>
              <textarea className="w-full p-2 border rounded-lg" rows={3} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Комментарий к заказу</label>
              <textarea className="w-full p-2 border rounded-lg" rows={3} />
            </div>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
          <div className="border rounded-lg p-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between py-2 border-b">
                <div>
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-sm text-gray-500 ml-2">×{item.quantity}</span>
                </div>
                <div>{item.product.price * item.quantity} ₸</div>
              </div>
            ))}
            
            <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t">
              <span>Итого:</span>
              <span>{total} ₸</span>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700">
              Подтвердить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}