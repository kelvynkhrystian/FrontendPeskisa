import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api', // Ajuste para a porta correta do seu backend
  withCredentials: true, // ESSENCIAL: Diz para o Axios aceitar e enviar os cookies automaticamente!
});
