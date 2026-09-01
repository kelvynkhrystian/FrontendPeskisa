import { api } from './api';

export const userService = {
  // Busca os dados do próprio usuário logado (requer cookie de sessão válido)
  getMe: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  // Atualiza dados do usuário (ex: e-mail ou senha) usando a rota PATCH do backend
  updateUser: async (
    id: number | string,
    data: { email?: string; senha?: string; novaSenha?: string }
  ) => {
    const response = await api.patch(`/api/users/${id}`, data);
    return response.data;
  },
};
