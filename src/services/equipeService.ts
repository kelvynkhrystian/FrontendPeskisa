import { api } from './api';

export const equipeService = {
  getAll: async () => {
    const response = await api.get('/api/equipes');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/equipes/${id}`);
    return response.data;
  },

  create: async (data: { nome: string; descricao?: string }) => {
    const response = await api.post('/api/equipes', data);
    return response.data;
  },

  update: async (id: number, data: { nome?: string; descricao?: string }) => {
    const response = await api.put(`/api/equipes/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/equipes/${id}`);
    return response.data;
  },
};
