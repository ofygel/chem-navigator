export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  manufacturer: string;
  attributes: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}