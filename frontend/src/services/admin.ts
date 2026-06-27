import api from './api';
import { AdminStats, User, Order, Measurement } from '../types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const r = await api.get('/admin/stats');
    return r.data;
  },
  // Users
  async getUsers(params?: { search?: string; role?: string; page?: number; limit?: number }) {
    const r = await api.get('/admin/users', { params });
    return r.data as { users: User[]; total: number; page: number; limit: number };
  },
  async getUser(id: string): Promise<User & { orders: Order[]; _count: any }> {
    const r = await api.get(`/admin/users/${id}`);
    return r.data;
  },
  async updateUser(id: string, data: Partial<User> & { newPassword?: string }): Promise<User> {
    const r = await api.put(`/admin/users/${id}`, data);
    return r.data;
  },
  async deactivateUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },
  // Orders
  async getOrders(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const r = await api.get('/admin/orders', { params });
    return r.data as { orders: Order[]; total: number; page: number; limit: number };
  },
  async getOrder(id: string): Promise<Order> {
    const r = await api.get(`/admin/orders/${id}`);
    return r.data;
  },
  async updateOrder(id: string, data: { status?: string; internalNotes?: string; assignedTo?: string; statusNote?: string }): Promise<Order> {
    const r = await api.put(`/admin/orders/${id}`, data);
    return r.data;
  },
  // Measurements
  async getMeasurements(params?: { userId?: string; productType?: string; page?: number }) {
    const r = await api.get('/admin/measurements', { params });
    return r.data as { measurements: (Measurement & { user: Pick<User, 'id' | 'name' | 'email'> })[]; total: number };
  },
  // Audit
  async getAuditLogs(params?: { entity?: string; page?: number }) {
    const r = await api.get('/admin/audit', { params });
    return r.data;
  },
};
