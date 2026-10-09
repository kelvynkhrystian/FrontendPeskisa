import { api } from './api';

export const relatorioService = {
  getByPesquisaId: async (pesquisaId: string | number) => {
    const response = await api.get(`/api/relatorios`, {
      params: { pesquisa_id: pesquisaId },
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/api/relatorios', data);
    return response.data;
  },

  update: async (id: string | number, data: any) => {
    const response = await api.put(`/api/relatorios/${id}`, data);
    return response.data;
  },
};
