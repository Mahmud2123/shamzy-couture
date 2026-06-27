import api from './api';
import { Product, CreateProductPayload } from '../types';

export const productsService = {
  async getAll(category?: string): Promise<Product[]> {
    const params = category ? { category } : {};
    const response = await api.get('/products', { params });
    return response.data;
  },
  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  async create(payload: CreateProductPayload): Promise<Product> {
    const response = await api.post('/products', payload);
    return response.data;
  },
  async update(id: string, payload: Partial<CreateProductPayload>): Promise<Product> {
    const response = await api.put(`/products/${id}`, payload);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
