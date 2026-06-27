import api from './api';
import { DesignRequest, CreateDesignRequestPayload } from '../types';

export const designRequestsService = {
  async create(payload: CreateDesignRequestPayload): Promise<DesignRequest> {
    const response = await api.post('/design-requests', payload);
    return response.data;
  },
  async getMyRequests(): Promise<DesignRequest[]> {
    const response = await api.get('/design-requests');
    return response.data;
  },
  async getAllRequests(): Promise<DesignRequest[]> {
    const response = await api.get('/design-requests/all');
    return response.data;
  },
  async updateStatus(id: string, status: string, adminNotes?: string): Promise<DesignRequest> {
    const response = await api.put(`/design-requests/${id}/status`, { status, adminNotes });
    return response.data;
  },
  async addMessage(id: string, content: string): Promise<void> {
    await api.post(`/design-requests/${id}/messages`, { content });
  },
};
