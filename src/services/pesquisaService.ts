import { api } from './api';

export const pesquisaService = {
  getAll: async () => {
    const response = await api.get('/api/pesquisas');
    return response.data;
  },
  create: async (data: unknown) => {
    const response = await api.post('/api/pesquisas', data);
    return response.data;
  },
  update: async (id: number, data: unknown) => {
    const response = await api.put(`/api/pesquisas/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/pesquisas/${id}`);
    return response.data;
  },
};
