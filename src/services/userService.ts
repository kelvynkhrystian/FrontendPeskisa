import { api } from './api';

export interface UpdateUserDTO {
  nome?: string;
  email?: string;
  role?: string;
  status?: string;
  equipe_id?: number | null;
  senha?: string;
  senha_atual?: string;
}

export const userService = {
  // 1. Listar todos os usuários (Admin - Usado na aba de funcionários)
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  // 2. Buscar dados do próprio utilizador logado
  getMe: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  // 3. Criar novo funcionário (Admin - Usado no modal de adicionar funcionário)
  create: async (data: {
    nome: string;
    email: string;
    senha: string;
    role?: string;
    equipe_id?: number | null;
  }) => {
    const response = await api.post('/api/users', data);
    return response.data;
  },

  // 4. Atualizar qualquer utilizador pelo ID (Admin - Usado no modal de editar funcionário)
  update: async (id: number, data: UpdateUserDTO) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  // 5. Deletar utilizador (Admin - Usado no botão de excluir funcionário)
  delete: async (id: number) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  // 6. Atualizar o próprio perfil (E-mail/Nome)
  updateProfile: async (data: {
    email?: string;
    nome?: string;
    senha_atual?: string;
  }) => {
    const response = await api.put('/api/users/me', data);
    return response.data;
  },

  // 7. Atualizar a própria palavra-passe
  updateMyPassword: async (data: { senhaAtual: string; novaSenha: string }) => {
    const response = await api.put('/api/users/me/password', data);
    return response.data;
  },
};
