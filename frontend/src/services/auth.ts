import api from './api';
import { LoginPayload, RegisterPayload, User } from '../types';

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  async register(payload: RegisterPayload): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
