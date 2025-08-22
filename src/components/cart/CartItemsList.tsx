import { useCartItems, useCartStore } from '@/store/cartStore';
import Image from 'next/image';

export const CartItemsList = () => {
  const items = useCartItems();
  const { updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-500">Ваша корзина пуста</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {items.map((item) => (
        <div key={item.product.id} className="p-4 border-b border-gray-100 flex items-center">
          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
            {item.product.image && (
              <Image
                src={item.product.image}
                alt={item.product.name}
                width={64}
                height={64}
                className="object-cover"
              />
            )}
          </div>
          
          <div className="ml-4 flex-grow">
            <h3 className="font-medium">{item.product.name}</h3>
            <p className="text-gray-500">{item.product.price} руб.</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md"
            >
              -
            </button>
            
            <span className="w-8 text-center">{item.quantity}</span>
            
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md"
            >
              +
            </button>
            
            <button
              onClick={() => removeItem(item.product.id)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};