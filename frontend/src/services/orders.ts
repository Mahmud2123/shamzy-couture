import api from './api';
import { Order, CreateOrderPayload } from '../types';

export const ordersService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const response = await api.post('/orders', payload);
    return response.data;
  },
  async getMyOrders(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data;
  },
  async getById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  async updateStatus(id: string, status: string): Promise<Order> {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};
