import { api } from './api';

export const pesquisaEquipeService = {
  async getByPesquisa(pesquisaId: number) {
    const response = await api.get(
      `/api/pesquisa-equipes?pesquisa_id=${pesquisaId}`
    );
    return response.data;
  },

  async vincular(pesquisaId: number, equipeId: number) {
    const response = await api.post('/api/pesquisa-equipes', {
      pesquisa_id: pesquisaId,
      equipe_id: equipeId,
    });
    return response.data;
  },

  async desvincular(pesquisaId: number, equipeId: number) {
    return await api.delete('/api/pesquisa-equipes', {
      data: {
        pesquisa_id: pesquisaId,
        equipe_id: equipeId,
      },
    });
  },
};
