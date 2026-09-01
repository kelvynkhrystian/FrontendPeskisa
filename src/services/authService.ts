import { api } from './api';

export const authService = {
  login: async (credentials: { email: string; senha: string }) => {
    const response = await api.post('api/auth/login', credentials);
    return response.data;
  },
};
