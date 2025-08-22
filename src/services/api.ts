import { Product, Category } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiService = {
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE}/api/categories`);
    return response.json();
  },

  async getProducts(categoryId?: string): Promise<Product[]> {
    const url = categoryId 
      ? `${API_BASE}/api/products?category=${categoryId}`
      : `${API_BASE}/api/products`;
    const response = await fetch(url);
    return response.json();
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
    return response.json();
  }
};