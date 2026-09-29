import { api } from './api';

export interface UpdateUserDTO {
  email?: string;
  senha_atual?: string; // Adicione esta linha se o backend usa senha_atual
  senha?: string; // Senha nova
  novaSenha?: string; // Ou novaSenha, dependendo do seu backend
}

export const userService = {
  getMe: async () => {
    const response = await api.get('/api/users/me'); // Ou a rota correta do seu perfil
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserDTO) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  updateProfile: async (data: {
    email?: string;
    nome?: string;
    senha_atual?: string;
  }) => {
    const response = await api.put('/api/users/me', data);
    return response.data;
  },

  updateMyPassword: async (data: { senhaAtual: string; novaSenha: string }) => {
    const response = await api.put('/api/users/me/password', data);
    return response.data;
  },
};
