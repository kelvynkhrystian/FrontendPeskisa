import { api } from './api';

export const templateService = {
  getAll: async () => {
    const response = await api.get('/api/templates-perguntas'); // Ajuste conforme a sua rota de backend de templates
    return response.data;
  },
  // Adicione métodos conforme a estrutura do seu backend
};
