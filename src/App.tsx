import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { ThemeProvider } from './contexts/ThemeContext';
// import { AuthProvider } from './contexts/AuthContext';

// Cria a instância global de cache para as requisições da API
const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* <AuthProvider> */}
        <RouterProvider router={router} />
        {/* </AuthProvider> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
