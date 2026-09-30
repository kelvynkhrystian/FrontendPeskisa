import { api } from './api';

export const perguntaOpcaoService = {
  create: async (data: {
    pergunta_id: number;
    opcao_texto: string;
    ordem: number;
  }) => {
    const response = await api.post('/api/pergunta-opcoes', data);
    return response.data;
  },

  // Método que faltava para listar as opções
  getAll: async (params?: any) => {
    const response = await api.get('/api/pergunta-opcoes', { params });
    return response.data;
  },

  // Método opcional para buscar uma opção específica por ID
  getById: async (id: number) => {
    const response = await api.get(`/api/pergunta-opcoes/${id}`);
    return response.data;
  },

  update: async (id: number, data: { opcao_texto: string; ordem: number }) => {
    const response = await api.put(`/api/pergunta-opcoes/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/pergunta-opcoes/${id}`);
    return response.data;
  },
};
