import { api } from './api';

export const perguntaService = {
  create: async (data: any) => {
    const response = await api.post('/api/perguntas', data);
    return response.data;
  },

  getAll: async (params?: any) => {
    // Permite passar parâmetros na URL, como ?pesquisa_id=1
    const response = await api.get('/api/perguntas', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/perguntas/${id}`);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/api/perguntas/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/perguntas/${id}`);
    return response.data;
  },
};
