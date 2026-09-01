import { api } from './api';

export const configService = {
  // Pega as configurações do sistema (rota pública ou protegida conforme seu backend)
  getConfig: async () => {
    const response = await api.get('/api/config');
    return response.data;
  },

  // Atualiza as configurações e envia arquivos (FormData)
  updateConfig: async (formData: FormData) => {
    const response = await api.put('/api/config', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
