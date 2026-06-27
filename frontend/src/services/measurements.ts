import api from './api';
import { Measurement, MeasurementPayload } from '../types';

export const measurementsService = {
  async create(payload: MeasurementPayload): Promise<Measurement> {
    const r = await api.post('/measurements', payload);
    return r.data;
  },
  async getMyMeasurements(productType?: string): Promise<Measurement[]> {
    const r = await api.get('/measurements', { params: productType ? { productType } : {} });
    return r.data;
  },
  async getById(id: string): Promise<Measurement> {
    const r = await api.get(`/measurements/${id}`);
    return r.data;
  },
  async update(id: string, payload: Partial<MeasurementPayload>): Promise<Measurement> {
    const r = await api.put(`/measurements/${id}`, payload);
    return r.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/measurements/${id}`);
  },
};
