import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração padrão do Vite para um projeto React.
// Nada de especial aqui: apenas habilitamos o plugin do React,
// que permite usar arquivos .jsx e o "Fast Refresh" (atualização
// automática da tela quando salvamos o código).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // porta padrão do Vite (pode mudar se estiver ocupada)
  },
});
